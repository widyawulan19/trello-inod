// Tambahkan state untuk form
const [form, setForm] = useState({
  detail_project: ''
});

// Setelah dataMarketingDesign di-fetch, sinkronkan form.detail_project
useEffect(() => {
  if (dataMarketingDesign?.detail_project) {
    setForm((prev) => ({
      ...prev,
      detail_project: dataMarketingDesign.detail_project,
    }));
  }
}, [dataMarketingDesign]);

// Fungsi untuk handle perubahan dari ReactQuill
const handleChangeQuill = (value) => {
  setForm((prevForm) => ({
    ...prevForm,
    detail_project: value || '', // fallback empty string untuk keamanan
  }));
};
