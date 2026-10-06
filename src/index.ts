import { Hono } from 'hono';

type Env = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Env }>();

app.get('/', (c) => {
  return c.text('Campus Equipment Booking API is running! Visit /api/equipment or /api/bookings.');
});

app.get('/api/equipment', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM equipment').all();
  return c.json(results);
});

app.get('/api/bookings', async (c) => {
  const { results } = await c.env.DB.prepare('SELECT * FROM bookings').all();
  return c.json(results);
});

app.get('/api/bookings/:id', async (c) => {
  const id = c.req.param('id');
  const booking = await c.env.DB.prepare('SELECT * FROM bookings WHERE id = ?').bind(id).first();
  
  if (!booking) {
    return c.json({ error: 'Booking not found' }, 404);
  }
  
  return c.json(booking);
});

app.post('/api/bookings', async (c) => {
  let body;
  try {
    body = await c.req.json();
  } catch (e) {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const { equipmentId, borrowerName, startAt, endAt, purpose } = body;

  if (!equipmentId || !borrowerName || !startAt || !endAt || !purpose) {
    return c.json({ error: 'Missing required fields' }, 400);
  }

  if (new Date(startAt) >= new Date(endAt)) {
    return c.json({ error: 'startAt must be before endAt' }, 400);
  }

  const eq = await c.env.DB.prepare('SELECT id FROM equipment WHERE id = ?').bind(equipmentId).first();
  if (!eq) {
    return c.json({ error: 'Equipment not found' }, 404);
  }

  const conflict = await c.env.DB.prepare(`
    SELECT id FROM bookings
    WHERE equipmentId = ?
    AND startAt < ?
    AND endAt > ?
  `).bind(equipmentId, endAt, startAt).first();
  
  if (conflict) {
    return c.json({ error: 'Booking time conflicts with an existing booking' }, 409);
  }

  const id = crypto.randomUUID();
  await c.env.DB.prepare(`
    INSERT INTO bookings (id, equipmentId, borrowerName, startAt, endAt, purpose)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(id, equipmentId, borrowerName, startAt, endAt, purpose).run();
  
  const newBooking = await c.env.DB.prepare('SELECT * FROM bookings WHERE id = ?').bind(id).first();
  
  return c.json(newBooking, 201);
});

app.patch('/api/bookings/:id', async (c) => {
  const id = c.req.param('id');
  
  const booking = await c.env.DB.prepare('SELECT * FROM bookings WHERE id = ?').bind(id).first() as any;
  if (!booking) {
    return c.json({ error: 'Booking not found' }, 404);
  }

  let body;
  try {
    body = await c.req.json();
  } catch (e) {
    return c.json({ error: 'Invalid JSON body' }, 400);
  }

  const equipmentId = body.equipmentId || booking.equipmentId;
  const borrowerName = body.borrowerName || booking.borrowerName;
  const startAt = body.startAt || booking.startAt;
  const endAt = body.endAt || booking.endAt;
  const purpose = body.purpose || booking.purpose;

  if (new Date(startAt) >= new Date(endAt)) {
    return c.json({ error: 'startAt must be before endAt' }, 400);
  }

  const eq = await c.env.DB.prepare('SELECT id FROM equipment WHERE id = ?').bind(equipmentId).first();
  if (!eq) {
    return c.json({ error: 'Equipment not found' }, 404);
  }

  const conflict = await c.env.DB.prepare(`
    SELECT id FROM bookings
    WHERE equipmentId = ?
    AND id != ?
    AND startAt < ?
    AND endAt > ?
  `).bind(equipmentId, id, endAt, startAt).first();
  
  if (conflict) {
    return c.json({ error: 'Booking time conflicts with an existing booking' }, 409);
  }

  await c.env.DB.prepare(`
    UPDATE bookings
    SET equipmentId = ?, borrowerName = ?, startAt = ?, endAt = ?, purpose = ?
    WHERE id = ?
  `).bind(equipmentId, borrowerName, startAt, endAt, purpose, id).run();
  
  const updatedBooking = await c.env.DB.prepare('SELECT * FROM bookings WHERE id = ?').bind(id).first();
  return c.json(updatedBooking, 200);
});

app.delete('/api/bookings/:id', async (c) => {
  const id = c.req.param('id');
  
  const booking = await c.env.DB.prepare('SELECT * FROM bookings WHERE id = ?').bind(id).first();
  if (!booking) {
    return c.json({ error: 'Booking not found' }, 404);
  }
  
  await c.env.DB.prepare('DELETE FROM bookings WHERE id = ?').bind(id).run();
  
  return new Response(null, { status: 204 });
});

export default app;
