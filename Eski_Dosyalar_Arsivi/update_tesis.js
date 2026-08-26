const fs = require('fs');
let content = fs.readFileSync('src/components/TesisYonetimi.jsx', 'utf-8');

// 1. Ensure supabase is imported
if (!content.includes('supabaseClient')) {
    content = content.replace(
        "import toast from 'react-hot-toast';",
        "import toast from 'react-hot-toast';\nimport { supabase } from '../supabaseClient';"
    );
}

// 2. Remove masterData import if it exists
content = content.replace(/import masterData from '\.\.\/data\/sinopTesisler_Master\.json';\r?\n?/g, '');

// 3. Replace useEffect data loading
const oldUseEffect =   useEffect(() => {\r\n    setDataList(masterData);\r\n  }, []);;
const newUseEffect =   useEffect(() => {
    const fetchTesisler = async () => {
      const { data, error } = await supabase.from('tesisler').select('*');
      if (error) {
        console.error('Veri cekme hatasi:', error);
        toast.error('Veriler cekilemedi!');
      } else {
        setDataList(data);
      }
    };
    fetchTesisler();
  }, []);;
content = content.replace(/useEffect\(\(\) => \{\r?\n\s*setDataList\(masterData\);\r?\n\s*\}, \[\]\);/g, newUseEffect);

// 4. Replace saveToDatabase
const newSave =   const saveToDatabase = async (updatedData) => {
    try {
      const { error } = await supabase.from('tesisler').upsert(updatedData);
      if (error) throw error;
      setDataList(updatedData);
      toast.success('Veriler Supabase bulutuna basariyla kaydedildi!');
    } catch (err) {
      console.error('Supabase save error:', err);
      toast.error('Buluta kayit sirasinda hata olustu.');
    }
  };;

content = content.replace(/const saveToDatabase = async \(updatedData\) => \{[\s\S]*?toast\.error\('Sunucu hatasi\.'\);\r?\n\s*\}\r?\n\s*\};/, newSave);

fs.writeFileSync('src/components/TesisYonetimi.jsx', content);
console.log('Done!');
