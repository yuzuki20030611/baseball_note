import importlib
import os
from pathlib import Path
from app.models.base import Base



current_dir = Path(__file__).resolve().parent
py_files = [f for f in os.listdir(current_dir) if f.endswith('.py') and f != '__init__.py']

for py_file in py_files:
    module_name = py_file[:-3]
    module = importlib.import_module(f'.{module_name}', package=__package__)
    
    for name in dir(module):
        if not name.startswith('_'):
            globals()[name] = getattr(module, name)

del importlib, os, Path, current_dir, py_files, module_name, module, name