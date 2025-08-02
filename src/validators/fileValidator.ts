
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

export interface ValidationError {
  type: 'missing_columns' | 'empty_values' | 'invalid_format' | 'size_limit' | 'structure_error';
  message: string;
  details?: {
    column?: string;
    row?: number;
    value?: string;
    expected?: string[];
    found?: string[];
  };
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings?: string[];
  stats?: {
    totalRows: number;
    totalColumns: number;
    emptyRows: number;
    emptyColumns: number;
  };
}

export interface FileValidationConfig {
  requiredColumns?: string[];
  maxRows?: number;
  maxColumns?: number;
  allowEmptyValues?: boolean;
  dateFormats?: string[];
  emailValidation?: boolean;
  numericValidation?: boolean;
}

const DEFAULT_CONFIG: FileValidationConfig = {
  requiredColumns: [],
  maxRows: 10000, // Plan Free limit
  maxColumns: 50,
  allowEmptyValues: false,
  dateFormats: ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'],
  emailValidation: true,
  numericValidation: true
};

export class FileValidator {
  private config: FileValidationConfig;

  constructor(config: Partial<FileValidationConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async validateFile(file: File): Promise<ValidationResult> {
    const errors: ValidationError[] = [];
    const warnings: string[] = [];

    try {
      // Validar tamaño del archivo
      if (file.size > 50 * 1024 * 1024) { // 50MB
        errors.push({
          type: 'size_limit',
          message: 'El archivo excede el tamaño máximo permitido de 50MB'
        });
        return { isValid: false, errors, warnings };
      }

      let data: any[][];
      let headers: string[];

      // Parsear archivo según tipo
      if (file.type === 'text/csv') {
        const result = await this.parseCSV(file);
        data = result.data;
        headers = result.headers;
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        const result = await this.parseExcel(file);
        data = result.data;
        headers = result.headers;
      } else if (file.type === 'application/json') {
        const result = await this.parseJSON(file);
        data = result.data;
        headers = result.headers;
      } else {
        errors.push({
          type: 'structure_error',
          message: 'Tipo de archivo no soportado'
        });
        return { isValid: false, errors, warnings };
      }

      // Validar estructura básica
      if (!data || data.length === 0) {
        errors.push({
          type: 'structure_error',
          message: 'El archivo está vacío o no se pudo leer'
        });
        return { isValid: false, errors, warnings };
      }

      // Validar límites
      if (data.length > this.config.maxRows!) {
        errors.push({
          type: 'size_limit',
          message: `El archivo excede el límite de ${this.config.maxRows} filas. Encontradas: ${data.length}`
        });
      }

      if (headers.length > this.config.maxColumns!) {
        errors.push({
          type: 'size_limit',
          message: `El archivo excede el límite de ${this.config.maxColumns} columnas. Encontradas: ${headers.length}`
        });
      }

      // Validar encabezados
      const headerValidation = this.validateHeaders(headers);
      errors.push(...headerValidation.errors);
      warnings.push(...headerValidation.warnings);

      // Validar columnas requeridas
      if (this.config.requiredColumns && this.config.requiredColumns.length > 0) {
        const missingColumns = this.config.requiredColumns.filter(
          col => !headers.some(header => 
            header.toLowerCase().includes(col.toLowerCase())
          )
        );

        if (missingColumns.length > 0) {
          errors.push({
            type: 'missing_columns',
            message: `Faltan columnas obligatorias: ${missingColumns.join(', ')}`,
            details: {
              expected: this.config.requiredColumns,
              found: headers
            }
          });
        }
      }

      // Validar contenido de las celdas
      const contentErrors = await this.validateContent(data, headers);
      errors.push(...contentErrors);

      // Calcular estadísticas
      const stats = this.calculateStats(data, headers);

      return {
        isValid: errors.length === 0,
        errors,
        warnings: warnings.length > 0 ? warnings : undefined,
        stats
      };

    } catch (error) {
      console.error('Error validating file:', error);
      errors.push({
        type: 'structure_error',
        message: `Error al procesar el archivo: ${error instanceof Error ? error.message : 'Error desconocido'}`
      });
      
      return { isValid: false, errors, warnings };
    }
  }

  private async parseCSV(file: File): Promise<{ data: any[][], headers: string[] }> {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: false,
        skipEmptyLines: true,
        complete: (results) => {
          if (results.errors.length > 0) {
            reject(new Error(`Error parsing CSV: ${results.errors[0].message}`));
            return;
          }
          
          const data = results.data as string[][];
          const headers = data.length > 0 ? data[0] : [];
          const rows = data.slice(1);
          
          resolve({ data: rows, headers });
        },
        error: (error) => reject(error)
      });
    });
  }

  private async parseExcel(file: File): Promise<{ data: any[][], headers: string[] }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const workbook = XLSX.read(e.target?.result, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          const data = jsonData as any[][];
          
          if (data.length === 0) {
            reject(new Error('Excel sheet is empty'));
            return;
          }
          
          const headers = data[0] || [];
          const rows = data.slice(1);
          
          resolve({ data: rows, headers });
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Error reading Excel file'));
      reader.readAsBinaryString(file);
    });
  }

  private async parseJSON(file: File): Promise<{ data: any[][], headers: string[] }> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const jsonData = JSON.parse(e.target?.result as string);
          
          if (!Array.isArray(jsonData) || jsonData.length === 0) {
            reject(new Error('JSON must be an array of objects'));
            return;
          }
          
          const headers = Object.keys(jsonData[0]);
          const data = jsonData.map(row => headers.map(header => row[header]));
          
          resolve({ data, headers });
        } catch (error) {
          reject(new Error('Invalid JSON format'));
        }
      };
      reader.onerror = () => reject(new Error('Error reading JSON file'));
      reader.readAsText(file);
    });
  }

  private validateHeaders(headers: string[]): { errors: ValidationError[], warnings: string[] } {
    const errors: ValidationError[] = [];
    const warnings: string[] = [];

    // Verificar encabezados vacíos
    const emptyHeaders = headers.filter((header, index) => 
      !header || header.toString().trim() === ''
    );

    if (emptyHeaders.length > 0) {
      errors.push({
        type: 'structure_error',
        message: `Encontradas ${emptyHeaders.length} columnas sin encabezado`
      });
    }

    // Verificar encabezados duplicados
    const duplicateHeaders = headers.filter((header, index) => 
      headers.indexOf(header) !== index
    );

    if (duplicateHeaders.length > 0) {
      warnings.push(`Encabezados duplicados encontrados: ${duplicateHeaders.join(', ')}`);
    }

    return { errors, warnings };
  }

  private async validateContent(data: any[][], headers: string[]): Promise<ValidationError[]> {
    const errors: ValidationError[] = [];

    for (let rowIndex = 0; rowIndex < Math.min(data.length, 1000); rowIndex++) { // Validar hasta 1000 filas para performance
      const row = data[rowIndex];
      
      for (let colIndex = 0; colIndex < headers.length; colIndex++) {
        const value = row[colIndex];
        const header = headers[colIndex];

        // Validar valores vacíos
        if (!this.config.allowEmptyValues && (value === null || value === undefined || value === '')) {
          errors.push({
            type: 'empty_values',
            message: `Valor vacío en la fila ${rowIndex + 2}, columna '${header}'`,
            details: {
              row: rowIndex + 2,
              column: header
            }
          });
          continue;
        }

        if (value !== null && value !== undefined && value !== '') {
          // Validar emails
          if (this.config.emailValidation && this.isEmailColumn(header)) {
            if (!this.isValidEmail(value.toString())) {
              errors.push({
                type: 'invalid_format',
                message: `Formato inválido en la fila ${rowIndex + 2}, columna '${header}': email inválido`,
                details: {
                  row: rowIndex + 2,
                  column: header,
                  value: value.toString()
                }
              });
            }
          }

          // Validar fechas
          if (this.isDateColumn(header)) {
            if (!this.isValidDate(value.toString())) {
              errors.push({
                type: 'invalid_format',
                message: `Formato inválido en la fila ${rowIndex + 2}, columna '${header}': fecha inválida`,
                details: {
                  row: rowIndex + 2,
                  column: header,
                  value: value.toString()
                }
              });
            }
          }

          // Validar números
          if (this.config.numericValidation && this.isNumericColumn(header)) {
            if (!this.isValidNumber(value.toString())) {
              errors.push({
                type: 'invalid_format',
                message: `Formato inválido en la fila ${rowIndex + 2}, columna '${header}': número inválido`,
                details: {
                  row: rowIndex + 2,
                  column: header,
                  value: value.toString()
                }
              });
            }
          }
        }
      }
    }

    return errors;
  }

  private calculateStats(data: any[][], headers: string[]) {
    const emptyRows = data.filter(row => 
      row.every(cell => cell === null || cell === undefined || cell === '')
    ).length;

    const emptyColumns = headers.filter((_, colIndex) =>
      data.every(row => {
        const value = row[colIndex];
        return value === null || value === undefined || value === '';
      })
    ).length;

    return {
      totalRows: data.length,
      totalColumns: headers.length,
      emptyRows,
      emptyColumns
    };
  }

  private isEmailColumn(header: string): boolean {
    const emailIndicators = ['email', 'e-mail', 'correo', 'mail'];
    return emailIndicators.some(indicator => 
      header.toLowerCase().includes(indicator)
    );
  }

  private isDateColumn(header: string): boolean {
    const dateIndicators = ['date', 'fecha', 'data', 'created', 'updated', 'birth'];
    return dateIndicators.some(indicator => 
      header.toLowerCase().includes(indicator)
    );
  }

  private isNumericColumn(header: string): boolean {
    const numericIndicators = ['price', 'precio', 'amount', 'valor', 'quantity', 'cantidad', 'age', 'edad', 'total'];
    return numericIndicators.some(indicator => 
      header.toLowerCase().includes(indicator)
    );
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidDate(dateString: string): boolean {
    // Intentar parsear diferentes formatos de fecha
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return true;
    }

    // Intentar formatos específicos
    const formats = [
      /^\d{2}\/\d{2}\/\d{4}$/, // DD/MM/YYYY
      /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
      /^\d{2}-\d{2}-\d{4}$/, // DD-MM-YYYY
    ];

    return formats.some(format => format.test(dateString));
  }

  private isValidNumber(numString: string): boolean {
    // Remover separadores de miles y cambiar coma por punto si es necesario
    const cleanNumber = numString.replace(/[.,\s]/g, match => {
      if (match === ',') return '.';
      return '';
    });

    return !isNaN(parseFloat(cleanNumber)) && isFinite(parseFloat(cleanNumber));
  }
}

// Factory function para crear validadores con configuraciones específicas
export const createFileValidator = (config?: Partial<FileValidationConfig>) => {
  return new FileValidator(config);
};

// Configuraciones predefinidas
export const EMAIL_LIST_CONFIG: Partial<FileValidationConfig> = {
  requiredColumns: ['email', 'name'],
  maxRows: 5000,
  emailValidation: true,
  allowEmptyValues: false
};

export const SALES_DATA_CONFIG: Partial<FileValidationConfig> = {
  requiredColumns: ['customer', 'amount', 'date'],
  maxRows: 10000,
  numericValidation: true,
  emailValidation: false
};

export const CUSTOMER_DATA_CONFIG: Partial<FileValidationConfig> = {
  requiredColumns: ['name', 'email'],
  maxRows: 10000,
  emailValidation: true,
  numericValidation: true,
  allowEmptyValues: false
};
