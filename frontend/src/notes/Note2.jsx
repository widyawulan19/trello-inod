const renderDataDelete = () => {
  if (!selectData) return null;
  if (previewLoading) return <p>Loading preview...</p>;
  if (!previewData) return <p>Preview tidak tersedia</p>;

  switch (selectData.type) {
    case "boards":
      return (
        <div>
          <h3>Detail Board Deleted</h3>
          <p><strong>Nama:</strong> {previewData.name}</p>
          <p><strong>Description:</strong> {previewData.description || "-"}</p>
          <p><strong>Created at:</strong> {new Date(previewData.create_at).toLocaleString("id-ID")}</p>
          <p><strong>Deleted at:</strong> {new Date(previewData.deleted_at).toLocaleString("id-ID")}</p>
        </div>
      );

    case "lists":
      return (
        <div>
          <h3>Detail List Deleted</h3>
          <p><strong>Nama:</strong> {previewData.name}</p>
          <p><strong>Board ID:</strong> #{previewData.board_id}</p>
          <p><strong>Deleted at:</strong> {new Date(previewData.deleted_at).toLocaleString("id-ID")}</p>
        </div>
      );

    case "cards":
      return (
        <div>
          <h3>Detail Card Deleted</h3>
          <p><strong>Title:</strong> {previewData.title}</p>
          <p><strong>Description:</strong> {previewData.description || "-"}</p>
          <p><strong>List ID:</strong> #{previewData.list_id}</p>
          <p><strong>Deleted at:</strong> {new Date(previewData.deleted_at).toLocaleString("id-ID")}</p>
        </div>
      );

    case "workspaces":
      return (
        <div>
          <h3>Detail Workspace Deleted</h3>
          <p><strong>Nama:</strong> {previewData.name}</p>
          <p><strong>Description:</strong> {previewData.description || "-"}</p>
          <p><strong>Deleted at:</strong> {new Date(previewData.deleted_at).toLocaleString("id-ID")}</p>
        </div>
      );

    case "data_marketing":
      return (
        <div>
          <h3>Detail Marketing Deleted</h3>
          <p><strong>Buyer:</strong> {previewData.buyer_name}</p>
          <p><strong>Order:</strong> {previewData.order_number}</p>
          <p><strong>Deleted at:</strong> {new Date(previewData.deleted_at).toLocaleString("id-ID")}</p>
        </div>
      );

    case "marketing_design":
      return (
        <div>
          <h3>Detail Marketing Design Deleted</h3>
          <p><strong>Buyer:</strong> {previewData.buyer_name}</p>
          <p><strong>Order:</strong> {previewData.order_number}</p>
          <p><strong>Deleted at:</strong> {new Date(previewData.deleted_at).toLocaleString("id-ID")}</p>
        </div>
      );

    default:
      return <p>Preview tidak didukung untuk tipe ini</p>;
  }
};
