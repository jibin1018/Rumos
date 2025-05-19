// backend/middleware/uploadMiddleware.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 라이센스 이미지 저장 경로 설정
const licenseStorage = multer.diskStorage({
  destination: function(req, file, cb) {
    const dir = path.join(__dirname, '../uploads/licenses');
    // 디렉토리가 없으면 생성
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function(req, file, cb) {
    // 파일명 설정: 현재시간_원본파일명
    cb(null, Date.now() + '_' + file.originalname);
  }
});

// 프로퍼티 이미지 저장 경로 설정
const propertyStorage = multer.diskStorage({
  destination: function(req, file, cb) {
    const dir = path.join(__dirname, '../uploads/properties');
    // 디렉토리가 없으면 생성
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function(req, file, cb) {
    // 파일명 설정: 현재시간_원본파일명
    cb(null, Date.now() + '_' + file.originalname);
  }
});

// 라이센스 이미지 업로드 미들웨어
const handleLicenseImageUpload = multer({
  storage: licenseStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB 제한
  fileFilter: function(req, file, cb) {
    // 이미지 파일만 허용
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
}).single('licenseImage'); // 'licenseImage'는 폼에서 사용할 필드명

// 프로퍼티 이미지 업로드 미들웨어 (다중 파일 업로드)
const handlePropertyImageUpload = multer({
  storage: propertyStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB 제한
  fileFilter: function(req, file, cb) {
    // 이미지 파일만 허용
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
}).array('images', 10); // 최대 10개 이미지 업로드 허용, 'images'는 폼에서 사용할 필드명

module.exports = {
  handleLicenseImageUpload,
  handlePropertyImageUpload
};
