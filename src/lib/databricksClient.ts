
/**
 * Databricks API Client
 * Maneja todas las interacciones con la API de Databricks Jobs v2.1
 */

export interface DatabricksConfig {
  workspaceUrl: string;
  token: string;
  jobId: string;
}

export interface DatabricksJobRun {
  run_id: number;
  number_in_job: number;
  state: {
    life_cycle_state: 'PENDING' | 'RUNNING' | 'TERMINATING' | 'TERMINATED' | 'SKIPPED' | 'INTERNAL_ERROR';
    result_state?: 'SUCCESS' | 'FAILED' | 'TIMEDOUT' | 'CANCELED';
    state_message?: string;
  };
  tasks?: Array<{
    run_id: number;
    task_key: string;
    state: {
      life_cycle_state: string;
      result_state?: string;
    };
  }>;
  start_time?: number;
  end_time?: number;
  execution_duration?: number;
}

export interface DatabricksJobParams {
  fileId: string;
  userId: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
}

export class DatabricksClient {
  private config: DatabricksConfig;

  constructor(config: DatabricksConfig) {
    this.config = config;
  }

  /**
   * Inicia un nuevo job run en Databricks
   */
  async runJob(params: DatabricksJobParams): Promise<{ run_id: number }> {
    const url = `${this.config.workspaceUrl}/api/2.1/jobs/run-now`;
    
    const payload = {
      job_id: parseInt(this.config.jobId),
      job_parameters: {
        file_id: params.fileId,
        user_id: params.userId,
        file_url: params.fileUrl,
        file_name: params.fileName,
        file_type: params.fileType,
        callback_url: `${this.config.workspaceUrl}/functions/v1/handle-databricks-callback`
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Databricks API Error: ${response.status} - ${errorData.message || 'Unknown error'}`);
    }

    return await response.json();
  }

  /**
   * Obtiene el estado de un job run específico
   */
  async getJobRun(runId: number): Promise<DatabricksJobRun> {
    const url = `${this.config.workspaceUrl}/api/2.1/jobs/runs/get?run_id=${runId}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.config.token}`,
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Databricks API Error: ${response.status} - ${errorData.message || 'Unknown error'}`);
    }

    return await response.json();
  }

  /**
   * Cancela un job run en ejecución
   */
  async cancelJobRun(runId: number): Promise<void> {
    const url = `${this.config.workspaceUrl}/api/2.1/jobs/runs/cancel`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ run_id: runId })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Databricks API Error: ${response.status} - ${errorData.message || 'Unknown error'}`);
    }
  }

  /**
   * Verifica la conectividad con Databricks
   */
  async healthCheck(): Promise<boolean> {
    try {
      const url = `${this.config.workspaceUrl}/api/2.1/jobs/list?limit=1`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.token}`,
          'Content-Type': 'application/json',
        }
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

/**
 * Utility para crear una instancia del cliente desde variables de entorno
 */
export function createDatabricksClient(): DatabricksClient {
  const workspaceUrl = Deno.env.get('DATABRICKS_WORKSPACE_URL');
  const token = Deno.env.get('DATABRICKS_TOKEN');
  const jobId = Deno.env.get('DATABRICKS_JOB_ID');

  if (!workspaceUrl || !token || !jobId) {
    throw new Error('Missing required Databricks environment variables: DATABRICKS_WORKSPACE_URL, DATABRICKS_TOKEN, DATABRICKS_JOB_ID');
  }

  return new DatabricksClient({
    workspaceUrl: workspaceUrl.replace(/\/$/, ''), // Remove trailing slash
    token,
    jobId
  });
}
