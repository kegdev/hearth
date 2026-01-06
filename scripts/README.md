# Hearth Scripts

Collection of utility scripts for Hearth application.

## 📁 Available Scripts

### HomeBox Import
Complete solution for importing inventory data and images from HomeBox to Hearth.

- **Location**: `homebox-import/`
- **Purpose**: Import CSV data and images from HomeBox inventory system
- **Features**: 
  - CSV data import (containers and items)
  - Image import with intelligent name matching (100% success rate)
  - Automatic image compression and format conversion
  - Firebase integration

**Quick Start:**
```bash
cd scripts/homebox-import
pip install -r requirements.txt
python homebox_import.py --help
python homebox_image_importer.py --help
```

See `homebox-import/README.md` for detailed documentation.

---

## 🚀 Adding New Scripts

When adding new script categories:

1. Create a new subdirectory: `scripts/your-script-category/`
2. Include a `README.md` with documentation
3. Include a `requirements.txt` if Python dependencies are needed
4. Update this main README with a brief description

## 📝 Script Guidelines

- **Self-contained**: Each script category should be in its own folder
- **Documented**: Include comprehensive README with usage examples
- **Dependencies**: List all requirements in `requirements.txt`
- **Error handling**: Provide clear error messages and troubleshooting
- **Security**: Never commit sensitive data (tokens, keys, URLs)