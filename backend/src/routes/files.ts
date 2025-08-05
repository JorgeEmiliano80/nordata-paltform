
import { Router } from 'express';
import { FileController } from '@/controllers/FileController';
import { authenticate } from '@/middleware/auth';
import multer from 'multer';
import { config } from '@/config/env';

const router = Router();
const fileController = new FileController();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: config.MAX_FILE_SIZE
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = config.ALLOWED_FILE_TYPES.map(type => {
      switch (type) {
        case 'csv': return 'text/csv';
        case 'json': return 'application/json';
        case 'xlsx': return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        default: return type;
      }
    });
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} not allowed`));
    }
  }
});

// All routes require authentication
router.use(authenticate);

// File routes
router.get('/', fileController.getFiles);
router.get('/stats', fileController.getFileStats);
router.post('/upload', upload.single('file'), fileController.uploadFile);
router.get('/:id', fileController.getFile);
router.delete('/:id', fileController.deleteFile);
router.post('/:id/process', fileController.processFile);

export default router;
