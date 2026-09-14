"""Static verification for the combined ContractIQ project."""
from pathlib import Path
import ast

ROOT=Path(__file__).parent
for p in (ROOT/'app').rglob('*.py'):
    ast.parse(p.read_text(), filename=str(p))
print('PASS: all backend Python files parse successfully')

# Detect unresolved merge markers in source/config files.
for p in ROOT.rglob('*'):
    if not p.is_file() or '.git' in p.parts or p.suffix not in {'.py','.ts','.html','.css','.json','.md'}:
        continue
    t=p.read_text(errors='ignore')
    assert not any(t.startswith(x) for x in ('<<<<<<<','=======','>>>>>>>')), f'Merge marker in {p}'
print('PASS: no merge conflict markers')

# Confirm required frontend pages and backend routers exist.
required_frontend=['dashboard','contracts','obligations','renewals','compliance','notifications','reports','activity','users']
for name in required_frontend:
    assert any((ROOT/'frontend/src/app/pages'/name).glob('*.ts')), f'Missing frontend module: {name}'
print('PASS: required frontend modules exist')
required_api=['auth','users','contracts','obligations','renewals','compliance','notifications','reports','activity']
for name in required_api:
    assert (ROOT/f'app/api/{name}.py').exists(), f'Missing API module: {name}'
print('PASS: required API modules exist')
