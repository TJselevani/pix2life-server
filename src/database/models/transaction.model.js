const { DataTypes } = require('sequelize');
const sequelize = require('../sequelize/init');

const Transaction = sequelize.define('Transaction', {
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  transactionId: {
    type: DataTypes.STRING,
    allowNull: false
  },
  amount: {
    type: DataTypes.FLOAT, // Using FLOAT for monetary values
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false
  },
  paymentMethod: {
    type: DataTypes.ENUM,
    values: ['Stripe', 'PayPal'],
    allowNull: false
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
//   tableName: 'transactions', // Optional: specify the table name
  timestamps: true // Set to true if you want Sequelize to manage createdAt and updatedAt fields
});

module.exports = Transaction;
