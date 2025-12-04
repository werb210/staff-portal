import { useParams } from "react-router-dom";

export default function ApplicationDetailPage() {
  const { id } = useParams();

  return (
    <>
      <h1>Application: {id}</h1>
      <p>Detail view coming soon.</p>
    </>
  );
}
