const renderDataMaster = () => {
  switch (activeData) {
    case "input":
      return (
        <DataTable 
          title="Marketing User"
          endpoint="/api/marketing-user"
          columns={["Name", "Email", "Role"]}
        />
      );
    case "kadiv":
      return (
        <DataTable 
          title="Kepala Divisi"
          endpoint="/api/kadiv"
          columns={["Name", "Division"]}
        />
      );
    case "status":
      return (
        <DataTable 
          title="Status Project"
          endpoint="/api/status"
          columns={["Status Name"]}
        />
      );
    default:
      return <div>Pilih kategori</div>;
  }
};
