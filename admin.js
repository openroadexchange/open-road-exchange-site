
const STORAGE_KEY="openRoadInventory";

// Role credentials
const USERS = {
  admin: { pass: "openroad123", role: "admin" },
  manager: { pass: "manager123", role: "manager" },
  viewer: { pass: "viewer123", role: "viewer" }
};

let currentRole = null;

// Load/save
function loadInventory(){ return JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]"); }
function saveInventory(data){ localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }

let inventory = loadInventory();

// UI
const loginSection = document.getElementById("loginSection");
const adminSection = document.getElementById("adminSection");
const roleDisplay = document.getElementById("roleDisplay");

// Login handler
document.getElementById("loginBtn").onclick = () => {
  const u = document.getElementById("loginUser").value.trim();
  const p = document.getElementById("loginPass").value.trim();

  if (!USERS[u] || USERS[u].pass !== p) {
    document.getElementById("loginError").textContent="Invalid login";
    return;
  }

  currentRole = USERS[u].role;
  loginSection.style.display="none";
  adminSection.style.display="block";
  roleDisplay.textContent = "Logged in as: " + currentRole.toUpperCase();

  applyRolePermissions();
  renderTable();
};

// Role restrictions
function applyRolePermissions(){
  const saveBtn = document.getElementById("saveBtn");
  const resetBtn = document.getElementById("resetBtn");

  if(currentRole === "viewer"){
    saveBtn.disabled = true;
    resetBtn.disabled = true;
    document.getElementById("vehicleForm").querySelectorAll("input,select,textarea")
      .forEach(el => el.disabled = true);
  }

  if(currentRole === "manager"){
    // Can edit, cannot delete
  }
}

function renderTable(){
  const body = document.getElementById("inventoryTableBody");
  body.innerHTML="";
  inventory.forEach(item=>{
    const tr=document.createElement("tr");
    tr.innerHTML = `
      <td>${item.title}</td>
      <td>${item.type}</td>
      <td>${item.year}</td>
      <td>${item.price}</td>
      <td>${item.status}</td>
      <td>
         <button onclick="editItem('${item.id}')">Edit</button>
         ${ currentRole === "admin" ? `<button onclick="deleteItem('${item.id}')">Delete</button>` :
           currentRole === "manager" ? "" : "" }
      </td>
    `;
    body.appendChild(tr);
  });
}

function editItem(id){
  if(currentRole==="viewer") return;
  const it = inventory.find(i=>i.id===id);
  if(!it) return;

  document.getElementById("vehicleId").value=it.id;
  document.getElementById("title").value=it.title;
  document.getElementById("type").value=it.type;
  document.getElementById("year").value=it.year;
  document.getElementById("price").value=it.price;
  document.getElementById("mileage").value=it.mileage;
  document.getElementById("stock").value=it.stock;
  document.getElementById("status").value=it.status;
  document.getElementById("image").value=it.image;
  document.getElementById("description").value=it.description;
}

function deleteItem(id){
  if(currentRole!=="admin") return;
  inventory = inventory.filter(i=>i.id!==id);
  saveInventory(inventory);
  renderTable();
}

// Save form
document.getElementById("vehicleForm").onsubmit = e =>{
  e.preventDefault();
  if(currentRole==="viewer") return;

  const id=document.getElementById("vehicleId").value || Date.now().toString();
  const data={
    id,
    title:document.getElementById("title").value,
    type:document.getElementById("type").value,
    year:document.getElementById("year").value,
    price:document.getElementById("price").value,
    mileage:document.getElementById("mileage").value,
    stock:document.getElementById("stock").value,
    status:document.getElementById("status").value,
    image:document.getElementById("image").value,
    description:document.getElementById("description").value
  };

  const idx = inventory.findIndex(i=>i.id===id);
  if(idx>=0) inventory[idx]=data;
  else inventory.push(data);

  saveInventory(inventory);
  renderTable();
  document.getElementById("vehicleForm").reset();
};

document.getElementById("resetBtn").onclick = ()=>document.getElementById("vehicleForm").reset();
