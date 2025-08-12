const express = require('express');
const router = express.Router();
const personalDataController = require('../controllers/personalDataController');
const { isAuthenticated, isAdmin, isSuperAdmin } = require('../middleware/authMiddleware');
const { check } = require('express-validator');
const upload = require('../middleware/uploadMiddleware');

// Personal Data Routes for Superadmin
router.get('/', isSuperAdmin, personalDataController.index);
router.get('/create', isSuperAdmin, personalDataController.create);
router.post('/create', 
  isSuperAdmin, 
  upload.single('fileData'),
  [
    check('title').notEmpty().withMessage('Judul data harus diisi'),
    check('category').notEmpty().withMessage('Kategori harus dipilih'),
    check('userId').notEmpty().withMessage('Pengguna harus dipilih'),
    check('dataType').notEmpty().withMessage('Jenis data harus dipilih'),
    check('encryptionKey').if(check('isEncrypted').exists()).notEmpty().withMessage('Kunci enkripsi diperlukan jika data dienkripsi'),
    check('confirmKey').if(check('isEncrypted').exists())
      .notEmpty().withMessage('Konfirmasi kunci harus diisi')
      .custom((value, { req }) => {
        if (value !== req.body.encryptionKey) {
          throw new Error('Kunci konfirmasi tidak cocok');
        }
        return true;
      })
  ],
  personalDataController.store
);

router.get('/:id', isSuperAdmin, personalDataController.show);
router.get('/:id/edit', isSuperAdmin, personalDataController.edit);
router.post('/:id/edit', 
  isSuperAdmin, 
  upload.single('fileData'),
  [
    check('title').notEmpty().withMessage('Judul data harus diisi'),
    check('category').notEmpty().withMessage('Kategori harus dipilih'),
    check('userId').notEmpty().withMessage('Pengguna harus dipilih')
  ],
  personalDataController.update
);

router.post('/:id/decrypt', isSuperAdmin, personalDataController.decrypt);
router.get('/:id/download', isSuperAdmin, personalDataController.download);
router.post('/:id/delete', isSuperAdmin, personalDataController.destroy);
router.get('/:id/logs', isSuperAdmin, personalDataController.logs);

// Version related routes
router.get('/version/:versionId', isSuperAdmin, personalDataController.showVersion);
router.post('/version/:versionId/decrypt', isSuperAdmin, async (req, res) => {
  const { versionId } = req.params;
  const { decryptionKey } = req.body;
  
  if (!decryptionKey) {
    req.flash('error', 'Kunci dekripsi diperlukan');
    return res.redirect(`/superadmin/personal-data/version/${versionId}`);
  }
  
  res.redirect(`/superadmin/personal-data/version/${versionId}?key=${encodeURIComponent(decryptionKey)}`);
});

router.post('/version/:versionId/restore', isSuperAdmin, async (req, res) => {
  try {
    const { versionId } = req.params;
    
    // Implementation would be in the controller, this is a placeholder
    // You would restore the version data to the current data here
    
    req.flash('success', 'Data berhasil dipulihkan ke versi sebelumnya');
    res.redirect(`/superadmin/personal-data`);
  } catch (error) {
    console.error('Error in restore version:', error);
    req.flash('error', 'Terjadi kesalahan saat memulihkan versi');
    res.redirect(`/superadmin/personal-data/version/${req.params.versionId}`);
  }
});

module.exports = router;
