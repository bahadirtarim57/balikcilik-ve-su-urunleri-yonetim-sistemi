import re
f=open('src/components/SunumModu.jsx', 'r', encoding='utf-8')
code=f.read()
f.close()

bad_block = '''  const selectedCity = localStorage.getItem('app-selectedCity');\n\n  if (!selectedCity) {\n      return (\n          <div style={{ padding: '24px', backgroundColor: '#f0f4f8', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>\n              <div style={{ background: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', textAlign: 'center', maxWidth: '400px' }}>\n                  <Presentation size={64} color=\
