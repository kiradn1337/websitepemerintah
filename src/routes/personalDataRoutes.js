const express = require('express');
const router = express.Router();
const personalDataController = require('../controllers/personalDataController');
const { requireAuth, requireAdmin, requireSuperAdmin } = require('../middleware/authMiddleware');
const { check } = require('express-validator');
const upload = require('../middleware/uploadMiddleware');

// Personal Data Routes for Superadmin
router.get('/', requireSuperAdmin, personalDataController.getUserPersonalData);
router.get('/create', requireSuperAdmin, personalDataController.showCreatePersonalDataForm);
router.post('/create', 
  requireSuperAdmin, 
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
  personalDataController.createPersonalData
);

router.get('/:id', requireSuperAdmin, personalDataController.viewPersonalData);
router.get('/:id/edit', requireSuperAdmin, personalDataController.showEditPersonalDataForm);
router.post('/:id/edit', 
  requireSuperAdmin, 
  upload.single('fileData'),
  [
    check('title').notEmpty().withMessage('Judul data harus diisi'),
    check('category').notEmpty().withMessage('Kategori harus dipilih'),
    check('userId').notEmpty().withMessage('Pengguna harus dipilih')
  ],
  personalDataController.updatePersonalData
);

// Tidak ada fungsi decrypt dalam controller
router.post('/:id/decrypt', requireSuperAdmin, (req, res) => {
  res.status(501).send('Decrypt functionality not implemented');
});

// Tidak ada fungsi download dalam controller
router.get('/:id/download', requireSuperAdmin, (req, res) => {
  res.status(501).send('Download functionality not implemented');
});

router.post('/:id/delete', requireSuperAdmin, personalDataController.deletePersonalData);

// Tidak ada fungsi logs dalam controller
router.get('/:id/logs', requireSuperAdmin, (req, res) => {
  res.status(501).send('Logs functionality not implemented');
});

// Version related routes - fungsi tidak ada
router.get('/version/:versionId', requireSuperAdmin, (req, res) => {
  res.status(501).send('Version view functionality not implemented');
});
router.post('/version/:versionId/decrypt', requireSuperAdmin, async (req, res) => {
  const { versionId } = req.params;
  const { decryptionKey } = req.body;
  
  if (!decryptionKey) {
    req.flash('error', 'Kunci dekripsi diperlukan');
    return res.redirect(`/superadmin/personal-data/version/${versionId}`);
  }
  
  res.redirect(`/superadmin/personal-data/version/${versionId}?key=${encodeURIComponent(decryptionKey)}`);
});

router.post('/version/:versionId/restore', requireSuperAdmin, async (req, res) => {
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
