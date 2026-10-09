const pool = require('../config/db');

// GET /products - lấy tất cả sản phẩm
exports.getAllProducts = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// GET /products/:id - lấy chi tiết 1 sản phẩm
exports.getProductById = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// POST /products - thêm sản phẩm mới
exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, quantity } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ message: 'name và price là bắt buộc' });
    }
    if (isNaN(price) || Number(price) < 0) {
      return res.status(400).json({ message: 'price phải là số >= 0' });
    }
    if (quantity !== undefined && (!Number.isInteger(Number(quantity)) || Number(quantity) < 0)) {
      return res.status(400).json({ message: 'quantity phải là số nguyên >= 0' });
    }

    const [result] = await pool.query(
      'INSERT INTO products (name, description, price, quantity) VALUES (?, ?, ?, ?)',
      [name, description || null, price, quantity || 0]
    );

    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// PUT /products/:id - cập nhật sản phẩm
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, quantity } = req.body;

    const [existing] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }

    const old = existing[0];
    const newName = name !== undefined ? name : old.name;
    const newDesc = description !== undefined ? description : old.description;
    const newPrice = price !== undefined ? price : old.price;
    const newQty = quantity !== undefined ? quantity : old.quantity;

    if (isNaN(newPrice) || Number(newPrice) < 0) {
      return res.status(400).json({ message: 'price phải là số >= 0' });
    }
    if (!Number.isInteger(Number(newQty)) || Number(newQty) < 0) {
      return res.status(400).json({ message: 'quantity phải là số nguyên >= 0' });
    }

    // updated_at tự cập nhật nhờ ON UPDATE CURRENT_TIMESTAMP trong DB
    await pool.query(
      'UPDATE products SET name = ?, description = ?, price = ?, quantity = ? WHERE id = ?',
      [newName, newDesc, newPrice, newQty, id]
    );

    const [rows] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};

// DELETE /products/:id - xóa sản phẩm
exports.deleteProduct = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }
    res.json({ message: 'Xóa sản phẩm thành công' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server', error: err.message });
  }
};