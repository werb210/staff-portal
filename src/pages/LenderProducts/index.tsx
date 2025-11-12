import { Link } from 'react-router-dom';
import { Spinner } from '../../components/common/Spinner';
import { Table } from '../../components/common/Table';
import { useLenderProducts } from '../../hooks/useLenderProducts';

const LenderProductsPage = () => {
  const { listQuery } = useLenderProducts();

  return (
    <section className="page">
      <header className="page-header">
        <div>
          <h2>Lender Products</h2>
          <p>Manage the available loan programs and offers.</p>
        </div>
        <Link to="/lender-products/new" className="btn btn-primary">
          Add Product
        </Link>
      </header>
      {listQuery.isLoading ? (
        <Spinner />
      ) : (
        <div className="card">
          <Table
            data={listQuery.data ?? []}
            keySelector={(product) => product.id}
            emptyMessage="No lender products found."
            columns={[
              { header: 'Name', accessor: 'name' },
              { header: 'Category', accessor: 'category' },
              { header: 'Interest Rate', accessor: (product) => `${product.interestRate}%` },
              { header: 'Max Amount', accessor: (product) => `$${product.maxAmount.toLocaleString()}` },
              {
                header: '',
                accessor: (product) => (
                  <Link to={`/lender-products/${product.id}`} className="link">
                    Edit
                  </Link>
                ),
              },
            ]}
          />
        </div>
      )}
    </section>
  );
};

export default LenderProductsPage;
