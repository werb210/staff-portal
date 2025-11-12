import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { Spinner } from '../../components/common/Spinner';
import { useLenderProducts } from '../../hooks/useLenderProducts';

const LenderProductEditPage = () => {
  const params = useParams();
  const navigate = useNavigate();
  const { productQuery, createMutation, updateMutation } = useLenderProducts();
  const isNew = params.productId === 'new';
  const productId = params.productId as string;
  const product = !isNew ? productQuery(productId) : null;

  const [formState, setFormState] = useState({
    name: '',
    category: '',
    interestRate: 0,
    maxAmount: 0,
    description: '',
  });

  useEffect(() => {
    if (product?.data) {
      setFormState({
        name: product.data.name,
        category: product.data.category,
        interestRate: product.data.interestRate,
        maxAmount: product.data.maxAmount,
        description: product.data.description ?? '',
      });
    }
  }, [product?.data]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isNew) {
      await createMutation.mutateAsync(formState);
    } else {
      await updateMutation.mutateAsync({ id: productId, input: formState });
    }
    navigate('/lender-products');
  };

  if (product?.isLoading) {
    return <Spinner />;
  }

  return (
    <section className="page">
      <header className="page-header">
        <h2>{isNew ? 'Add Product' : 'Edit Product'}</h2>
      </header>
      <form className="card form" onSubmit={handleSubmit}>
        <label>
          Name
          <input
            value={formState.name}
            onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
            required
          />
        </label>
        <label>
          Category
          <input
            value={formState.category}
            onChange={(event) => setFormState((prev) => ({ ...prev, category: event.target.value }))}
            required
          />
        </label>
        <label>
          Interest Rate
          <input
            type="number"
            step="0.01"
            value={formState.interestRate}
            onChange={(event) => setFormState((prev) => ({ ...prev, interestRate: Number(event.target.value) }))}
            required
          />
        </label>
        <label>
          Max Amount
          <input
            type="number"
            value={formState.maxAmount}
            onChange={(event) => setFormState((prev) => ({ ...prev, maxAmount: Number(event.target.value) }))}
            required
          />
        </label>
        <label>
          Description
          <textarea
            value={formState.description}
            onChange={(event) => setFormState((prev) => ({ ...prev, description: event.target.value }))}
          />
        </label>
        <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
          Save
        </Button>
      </form>
    </section>
  );
};

export default LenderProductEditPage;
