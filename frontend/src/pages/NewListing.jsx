import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const NewListing = () => {
  const navigate = useNavigate(); // Used to redirect the user after submitting
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'Electronics', 
    seller: '65a1b2c3d4e5f6g7h8i9j0k1' 
  });

  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 3. The Bridge: Send data to Express when they click Submit
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevents the page from refreshing
    
    try {
      const response = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        // If successful, instantly send the user back to the Feed page to see their new item!
        navigate('/listings'); 
      } else {
        alert('Failed to create listing');
      }
    } catch (error) {
      console.error(error);
    }
  };

  // 4. The UI
  return (
    <div style={{ maxWidth: '500px', margin: '0 auto' }}>
      <h2>Post a New Item</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        <input 
          type="text" name="title" placeholder="Item Title" required 
          value={formData.title} onChange={handleChange} 
        />
        
        <textarea 
          name="description" placeholder="Describe the item..." required 
          value={formData.description} onChange={handleChange} 
        />
        
        <input 
          type="number" name="price" placeholder="Price (₹)" required 
          value={formData.price} onChange={handleChange} 
        />
        
        <select name="category" value={formData.category} onChange={handleChange}>
          <option value="Electronics">Electronics</option>
          <option value="Books">Books</option>
          <option value="Cycles">Cycles</option>
          <option value="Services">Services</option>
        </select>

        <button type="submit" style={{ padding: '10px', background: '#2ecc71', color: 'white', border: 'none' }}>
          Post Item
        </button>
      </form>
    </div>
  );
};

export default NewListing;