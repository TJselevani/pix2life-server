
const { uploadData, getData, getDataByID, updateData, deleteData } = require('../services/storage/firebase.service');

const upload = ('/firebase', async (req, res) => {
  await uploadData();
  res.json({ message: 'Data uploaded successfully' });
});

const get = ('/data', async (req, res) => {
  const data = await getData();
  res.json(data);
});

const getById = ('/data/:id', async (req, res) => {
  const data = await getDataByID(req.params.id);
  res.json(data);
});

const update = ('/data/:id', async (req, res) => {
  const newData = req.body;
  await updateData(req.params.id, newData);
  res.json({ message: 'Data updated successfully' });
});

const del = ('/data/:id', async (req, res) => {
  await deleteData(req.params.id);
  res.json({ message: 'Data deleted successfully' });
});

module.exports = {upload, get, getById, update, del};