// ===== SUPABASE CONFIG =====
// Ganti URL dan KEY ini dengan milik kamu dari Supabase Dashboard
// Dashboard > Settings > API > URL & anon/public key

var SUPABASE_URL = 'https://hlsyjaszrzjdxxecxlrx.supabase.co';
var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhsc3lqYXN6cnpqZHh4ZWN4bHJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyMTcwMjEsImV4cCI6MjEwNDc5MzAyMX0.lsxaNfs_RVxf9pxpcO7X2lXeEyKhjG6GMBV7ls0EDus';

// Jangan edit di bawah ini
var SB_HEADERS = {
  'apikey': SUPABASE_KEY,
  'Authorization': 'Bearer ' + SUPABASE_KEY,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

async function sbHandleError(r, op) {
  var msg = 'Supabase ' + op + ' error (' + r.status + ')';
  try {
    var j = await r.json();
    if (j && (j.message || j.error || j.hint || j.details)) {
      msg += ': ' + (j.message || j.error || j.hint || j.details);
    }
  } catch(e) {
    try {
      var t = await r.text();
      if (t) msg += ': ' + t;
    } catch(e2) {}
  }
  return new Error(msg);
}

// Helper functions
async function sbGet(table, query) {
  var url = SUPABASE_URL + '/rest/v1/' + table;
  if (query) url += '?' + query;
  var r = await fetch(url, { headers: SB_HEADERS });
  if (!r.ok) throw await sbHandleError(r, 'GET ' + table);
  return r.json();
}

async function sbPost(table, data) {
  var r = await fetch(SUPABASE_URL + '/rest/v1/' + table, {
    method: 'POST',
    headers: Object.assign({}, SB_HEADERS, { 'Prefer': 'return=representation' }),
    body: JSON.stringify(data)
  });
  if (!r.ok) throw await sbHandleError(r, 'POST ' + table);
  var text = await r.text();
  return text ? JSON.parse(text) : null;
}

async function sbUpsert(table, data) {
  var r = await fetch(SUPABASE_URL + '/rest/v1/' + table, {
    method: 'POST',
    headers: Object.assign({}, SB_HEADERS, { 'Prefer': 'resolution=merge-duplicates,return=representation' }),
    body: JSON.stringify(data)
  });
  if (!r.ok) throw await sbHandleError(r, 'UPSERT ' + table);
  var text = await r.text();
  return text ? JSON.parse(text) : null;
}

async function sbUpdate(table, data, filter) {
  var url = SUPABASE_URL + '/rest/v1/' + table + '?' + filter;
  var r = await fetch(url, {
    method: 'PATCH',
    headers: Object.assign({}, SB_HEADERS, { 'Prefer': 'return=representation' }),
    body: JSON.stringify(data)
  });
  if (!r.ok) throw await sbHandleError(r, 'PATCH ' + table);
  var text = await r.text();
  return text ? JSON.parse(text) : null;
}

async function sbDelete(table, filter) {
  var url = SUPABASE_URL + '/rest/v1/' + table + '?' + filter;
  var r = await fetch(url, {
    method: 'DELETE',
    headers: SB_HEADERS
  });
  if (!r.ok) throw await sbHandleError(r, 'DELETE ' + table);
}
