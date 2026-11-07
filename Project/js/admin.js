// PÀNN Admin — tương thích API /api/auth, /api/products, /api/categories, /api/orders
const $ = id => document.getElementById(id);
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money = v => (Number(v) || 0).toLocaleString('vi-VN') + 'đ';
const tokenKey = 'pann_admin_token';
let token = localStorage.getItem(tokenKey) || '';
let categories = [], products = [], orders = [], productPage = 1, productTotalPages = 1;
const limit = 20;
const productModal = new bootstrap.Modal($('product-modal'));
const categoryModal = new bootstrap.Modal($('category-modal'));
function notice(message, type='success') { const el=$('message'); el.className=`alert alert-${type}`; el.textContent=message; window.scrollTo({top:0,behavior:'smooth'}); }
function errorMessage(err) { notice(err.message || 'Có lỗi xảy ra', 'danger'); }
async function api(path, options={}) {
  const headers = {...(options.body ? {'Content-Type':'application/json'} : {}), ...(token ? {Authorization:`Bearer ${token}`} : {}), ...(options.headers||{})};
  const response = await fetch(path, {...options, headers});
  const data = await response.json().catch(()=>({}));
  if (!response.ok || data.success === false) {
    if (response.status === 401) { localStorage.removeItem(tokenKey); token=''; showLogin(); }
    throw new Error(data.message || `Lỗi HTTP ${response.status}`);
  }
  return data;
}
function showLogin(){ $('login-view').classList.remove('d-none'); $('admin-view').classList.add('d-none'); $('logout-btn').classList.add('d-none'); $('admin-user').textContent=''; }
function showAdmin(user){ $('login-view').classList.add('d-none'); $('admin-view').classList.remove('d-none'); $('logout-btn').classList.remove('d-none'); $('admin-user').textContent=user.name || user.email || 'Admin'; }
async function verifyAdmin(){
  if(!token){showLogin();return;}
  try {const r=await api('/api/auth/me'); const user=r.data || r.user; if(user?.role !== 'admin') throw new Error('Tài khoản không có quyền Admin'); showAdmin(user); await loadAll();}
  catch(err){token='';localStorage.removeItem(tokenKey);showLogin();$('login-error').textContent=err.message;}
}
$('login-form').addEventListener('submit', async e=>{
  e.preventDefault(); $('login-error').textContent='';
  try {
    const r=await api('/api/auth/login',{method:'POST',body:JSON.stringify({email:$('login-email').value.trim(),password:$('login-password').value})});
    if(r.user?.role!=='admin') throw new Error('Tài khoản này không phải Admin');
    token=r.token; localStorage.setItem(tokenKey,token); $('login-password').value=''; await verifyAdmin();
  } catch(err){$('login-error').textContent=err.message;}
});
$('logout-btn').addEventListener('click',()=>{token='';localStorage.removeItem(tokenKey);showLogin();});
$('admin-nav').addEventListener('click',e=>{const btn=e.target.closest('[data-page]');if(!btn)return;document.querySelectorAll('#admin-nav .nav-link').forEach(x=>x.classList.toggle('active',x===btn));document.querySelectorAll('.page-section').forEach(x=>x.classList.toggle('active',x.id==='page-'+btn.dataset.page));});
async function loadAll(){try{await Promise.all([loadCategories(),loadProducts(),loadOrders()]);renderDashboard();}catch(err){errorMessage(err);}}
function renderDashboard(){ $('stat-products').textContent=window.productCount ?? products.length; $('stat-categories').textContent=categories.length; $('stat-orders').textContent=orders.length; $('stat-revenue').textContent=money(orders.filter(o=>o.orderStatus==='COMPLETED').reduce((s,o)=>s+(Number(o.totalAmount)||0),0)); }
async function loadCategories(){const r=await api('/api/categories'); categories=r.data||[]; $('categories-body').innerHTML=categories.map(c=>`<tr><td>${esc(c.name)}</td><td>${esc(c.slug)}</td><td>${esc(c.description)}</td><td><button class="btn btn-sm btn-outline-primary" data-cat-edit="${esc(c._id)}">Sửa</button> <button class="btn btn-sm btn-outline-danger" data-cat-delete="${esc(c._id)}">Xóa</button></td></tr>`).join('') || '<tr><td colspan="4">Chưa có danh mục</td></tr>';const options=categories.map(c=>`<option value="${esc(c._id)}">${esc(c.name)}</option>`).join('');$('p-category').innerHTML=options;$('product-filter').innerHTML='<option value="">Tất cả danh mục</option>'+options; $('stat-categories').textContent=categories.length;}
async function loadProducts(){const q=new URLSearchParams({page:productPage,limit,search:$('product-search').value.trim()}); if($('product-filter').value)q.set('category',$('product-filter').value); const r=await api('/api/products?'+q);products=r.data||[];window.productCount=r.total ?? products.length;productTotalPages=r.totalPages||1; $('stat-products').textContent=window.productCount;$('product-page-label').textContent=`Trang ${productPage}/${productTotalPages} — ${r.total ?? products.length} sản phẩm`;$('product-prev').disabled=productPage<=1;$('product-next').disabled=productPage>=productTotalPages;
 $('products-body').innerHTML=products.map(p=>`<tr><td><img src="${esc(p.image||'')}" alt=""></td><td>${esc(p.name)}</td><td>${esc(p.category?.name||'')}</td><td>${money(p.salePrice)}</td><td>${esc(p.stock)}</td><td><button class="btn btn-sm btn-outline-primary" data-prod-edit="${esc(p._id)}">Sửa</button> <button class="btn btn-sm btn-outline-danger" data-prod-delete="${esc(p._id)}">Xóa</button></td></tr>`).join('')||'<tr><td colspan="6">Không tìm thấy sản phẩm</td></tr>'; }
$('product-search-btn').addEventListener('click',()=>{productPage=1;loadProducts().catch(errorMessage);});
$('product-search').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();productPage=1;loadProducts().catch(errorMessage);}});
$('product-prev').addEventListener('click',()=>{if(productPage>1){productPage--;loadProducts().catch(errorMessage);}});
$('product-next').addEventListener('click',()=>{if(productPage<productTotalPages){productPage++;loadProducts().catch(errorMessage);}});
$('new-product').addEventListener('click',()=>{ $('product-form').reset(); $('product-id').value=''; $('p-brand').value='PÀNN'; $('p-stock').value=10; $('p-rating').value=5; $('product-modal-title').textContent='Thêm sản phẩm';productModal.show();});
$('products-body').addEventListener('click',async e=>{
 const edit=e.target.closest('[data-prod-edit]'), del=e.target.closest('[data-prod-delete]');
 if(edit){try{const r=await api('/api/products/'+encodeURIComponent(edit.dataset.prodEdit));const p=r.data; $('product-id').value=p._id;$('p-name').value=p.name||'';$('p-category').value=p.category?._id||p.category||'';$('p-brand').value=p.brand||'';$('p-original').value=p.originalPrice??0;$('p-sale').value=p.salePrice??0;$('p-stock').value=p.stock??0;$('p-image').value=p.image||'';$('p-rating').value=p.rating??5;$('p-description').value=p.description||'';$('p-featured').checked=!!p.isFeatured;$('product-modal-title').textContent='Sửa sản phẩm';productModal.show();}catch(err){errorMessage(err);}}
 if(del){if(!confirm('Bạn chắc chắn muốn xóa sản phẩm này?'))return;try{await api('/api/products/'+encodeURIComponent(del.dataset.prodDelete),{method:'DELETE'});notice('Đã xóa sản phẩm');await loadProducts();renderDashboard();}catch(err){errorMessage(err);}}
});
$('product-form').addEventListener('submit',async e=>{
 e.preventDefault();const id=$('product-id').value;const payload={name:$('p-name').value.trim(),category:$('p-category').value,brand:$('p-brand').value.trim(),originalPrice:Number($('p-original').value),salePrice:Number($('p-sale').value),stock:Number($('p-stock').value),image:$('p-image').value.trim(),rating:Number($('p-rating').value),description:$('p-description').value.trim(),isFeatured:$('p-featured').checked};
 try{await api(id?'/api/products/'+encodeURIComponent(id):'/api/products',{method:id?'PUT':'POST',body:JSON.stringify(payload)});productModal.hide();notice(id?'Đã cập nhật sản phẩm':'Đã thêm sản phẩm');await loadProducts();renderDashboard();}catch(err){errorMessage(err);}
});
$('new-category').addEventListener('click',()=>{$('category-form').reset();$('category-id').value='';$('category-modal-title').textContent='Thêm danh mục';categoryModal.show();});
$('categories-body').addEventListener('click',async e=>{const edit=e.target.closest('[data-cat-edit]'),del=e.target.closest('[data-cat-delete]');if(edit){const c=categories.find(x=>x._id===edit.dataset.catEdit);if(!c)return;$('category-id').value=c._id;$('c-name').value=c.name||'';$('c-description').value=c.description||'';$('c-image').value=c.image||'';$('category-modal-title').textContent='Sửa danh mục';categoryModal.show();}if(del){if(!confirm('Xóa danh mục có thể ảnh hưởng các sản phẩm đang thuộc danh mục này. Bạn vẫn muốn xóa?'))return;try{await api('/api/categories/'+encodeURIComponent(del.dataset.catDelete),{method:'DELETE'});notice('Đã xóa danh mục');await loadCategories();renderDashboard();}catch(err){errorMessage(err);}}});
$('category-form').addEventListener('submit',async e=>{e.preventDefault();const id=$('category-id').value;const payload={name:$('c-name').value.trim(),description:$('c-description').value.trim(),image:$('c-image').value.trim()};try{await api(id?'/api/categories/'+encodeURIComponent(id):'/api/categories',{method:id?'PUT':'POST',body:JSON.stringify(payload)});categoryModal.hide();notice(id?'Đã sửa danh mục':'Đã thêm danh mục');await loadCategories();renderDashboard();}catch(err){errorMessage(err);}});
async function loadOrders(){const r=await api('/api/orders');orders=r.data||[];$('stat-orders').textContent=orders.length; $('orders-body').innerHTML=orders.map(o=>`<tr><td><strong>${esc(o.orderCode)}</strong><div class="small muted">${esc((o.items||[]).map(i=>`${i.name} × ${i.quantity}`).join(', '))}</div></td><td>${esc(o.customerName)}<div class="small muted">${esc(o.customerPhone)}</div></td><td>${o.createdAt?new Date(o.createdAt).toLocaleDateString('vi-VN'):''}</td><td>${money(o.totalAmount)}</td><td><span class="badge ${o.paymentStatus==='PAID'?'bg-success':'bg-warning text-dark'}">${esc(o.paymentStatus)}</span></td><td>${esc(o.orderStatus)}</td><td><div class="d-flex gap-1 flex-wrap"><button class="btn btn-sm btn-outline-success" data-order-pay="${esc(o._id)}" ${o.paymentStatus==='PAID'?'disabled':''}>Duyệt tiền</button><button class="btn btn-sm btn-outline-primary" data-order-deliver="${esc(o._id)}" ${o.orderStatus==='COMPLETED'?'disabled':''}>Đã giao</button></div></td></tr>`).join('')||'<tr><td colspan="7">Chưa có đơn hàng</td></tr>';renderDashboard();}
$('refresh-orders').addEventListener('click',()=>loadOrders().catch(errorMessage));
$('orders-body').addEventListener('click',async e=>{const pay=e.target.closest('[data-order-pay]'),deliver=e.target.closest('[data-order-deliver]');if(!pay&&!deliver)return;const id=pay?.dataset.orderPay||deliver.dataset.orderDeliver;const action=pay?'pay':'deliver';const question=pay?'Bạn đã kiểm tra tiền thực nhận trong tài khoản ngân hàng và muốn duyệt thanh toán?':'Bạn xác nhận đơn hàng đã được giao thực tế?';if(!confirm(question))return;try{await api(`/api/orders/${encodeURIComponent(id)}/${action}`,{method:'PUT'});notice(pay?'Đã xác nhận thanh toán':'Đã xác nhận giao hàng');await loadOrders();}catch(err){errorMessage(err);}});
verifyAdmin();
