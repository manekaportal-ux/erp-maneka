import { useState, useEffect, useCallback, useMemo, useRef } from "react";

const API = "";
const DEPTS = ["All", "OnBuy", "eBay", "Amazon", "TikTok Shop"];
const DEPT_COLORS = { OnBuy:"#f97316", eBay:"#f59e0b", Amazon:"#ef4444", "TikTok Shop":"#8b5cf6" };
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const SHORT_MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const MONTH_COLORS = [
  "#3b82f6", // Jan - Blue
  "#8b5cf6", // Feb - Purple
  "#22c55e", // Mar - Green
  "#f59e0b", // Apr - Amber
  "#ef4444", // May - Red
  "#06b6d4", // Jun - Cyan
  "#f97316", // Jul - Orange
  "#ec4899", // Aug - Pink
  "#84cc16", // Sep - Lime
  "#6366f1", // Oct - Indigo
  "#14b8a6", // Nov - Teal
  "#e11d48", // Dec - Rose
];

function getCurrentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
}

// ── EXPANDED ROW COMPONENT ──
function ExpandedRow({ a, entryData, onSave, onCancel, isCeo }) {
  const [local, setLocal] = useState({
    totalProfit: entryData.totalProfit||"",
    hmrcFee: entryData.hmrcFee||"",
    counterfeit: entryData.counterfeit||"",
    leavesPenalty: entryData.leavesPenalty||"",
    feedbackDed: entryData.feedbackDed||"",
    lateArrival: entryData.lateArrival||"",
    warningPenalty: entryData.warningPenalty||"",
    otherPenalty: entryData.otherPenalty||"",
    paymentStatus: entryData.paymentStatus||"",
    zoneStatus: entryData.zoneStatus||"",
    earningStatus: entryData.earningStatus||"",
    invoiceStatus: entryData.invoiceStatus||"",
    notes: entryData.notes||"",
  });
  const [saving, setSaving] = useState(false);

  const profit = parseFloat(local.totalProfit)||0;
  const totalPenGBP = (parseFloat(local.hmrcFee)||0)+(parseFloat(local.counterfeit)||0)+(parseFloat(local.leavesPenalty)||0)+(parseFloat(local.feedbackDed)||0)+(parseFloat(local.lateArrival)||0)+(parseFloat(local.warningPenalty)||0)+(parseFloat(local.otherPenalty)||0);
  const agGBP = profit*((a.agencyPct||20)/100);
  const vaGross = profit*((a.vaPct||20)/100);
  const vaGBP = vaGross - totalPenGBP;

  async function handleSave() { setSaving(true); await onSave(a.id, local); setSaving(false); }

  const inp = (field, label) => (
    <div>
      <div style={{fontSize:10.5,color:"rgba(255,255,255,0.4)",marginBottom:5,fontWeight:500}}>{label}</div>
      <input type="number" value={local[field]} onChange={e=>setLocal(p=>({...p,[field]:e.target.value}))} placeholder="0.00"
        style={{width:"100%",background:"rgba(255,255,255,0.07)",border:"0.5px solid rgba(255,255,255,0.15)",borderRadius:8,padding:"9px 10px",color:"#fff",fontSize:13,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
    </div>
  );

  const sel = (field, label, opts) => (
    <div>
      <div style={{fontSize:10.5,color:"rgba(255,255,255,0.4)",marginBottom:5,fontWeight:500}}>{label}</div>
      <select value={local[field]} onChange={e=>setLocal(p=>({...p,[field]:e.target.value}))}
        style={{width:"100%",background:"#1a1d2e",border:"0.5px solid rgba(255,255,255,0.15)",color:local[field]?"#fff":"rgba(255,255,255,0.4)",borderRadius:8,padding:"9px 10px",fontSize:12,fontFamily:"inherit",outline:"none"}}>
        <option value="">— Select —</option>
        {opts.map(o=><option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  return (
    <div style={{borderTop:"0.5px solid rgba(255,255,255,0.07)",padding:"18px 16px",background:"rgba(99,102,241,0.03)"}}>
      <div style={{marginBottom:6,fontSize:11,color:"rgba(255,255,255,0.3)",textTransform:"uppercase",letterSpacing:"0.08em"}}>Financials</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
        {inp("totalProfit","Total Profit £")}
        {inp("hmrcFee","HMRC Fee £")}
        {inp("counterfeit","Counterfeit £")}
        {inp("leavesPenalty","Leaves Penalty £")}
        {inp("feedbackDed","Feedback Ded £")}
        {inp("lateArrival","Late Arrival £")}
        {inp("warningPenalty","Warning Penalty £")}
        {inp("otherPenalty","Other Penalty £")}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:8,marginBottom:14,background:"rgba(255,255,255,0.04)",borderRadius:10,padding:"12px 14px"}}>
        <div><div style={{fontSize:10,color:"rgba(255,255,255,0.3)",marginBottom:3}}>Total Profit</div><div style={{fontSize:15,fontWeight:600,color:"#fff"}}>£{profit.toFixed(2)}</div></div>
        <div><div style={{fontSize:10,color:"rgba(255,255,255,0.3)",marginBottom:3}}>Total Penalties</div><div style={{fontSize:15,fontWeight:600,color:"#f87171"}}>£{totalPenGBP.toFixed(2)}</div></div>
        <div><div style={{fontSize:10,color:"rgba(255,255,255,0.3)",marginBottom:3}}>Net (Profit-Pen)</div><div style={{fontSize:15,fontWeight:600,color:(profit-totalPenGBP)<0?"#f87171":"#86efac"}}>£{(profit-totalPenGBP).toFixed(2)}</div></div>
        <div><div style={{fontSize:10,color:"rgba(255,255,255,0.3)",marginBottom:3}}>Agency ({a.agencyPct}%)</div><div style={{fontSize:15,fontWeight:600,color:"#c4b5fd"}}>£{agGBP.toFixed(2)}</div></div>
        <div><div style={{fontSize:10,color:"rgba(255,255,255,0.3)",marginBottom:3}}>VA GBP ({a.vaPct}%)</div><div style={{fontSize:15,fontWeight:600,color:"#86efac"}}>£{vaGBP.toFixed(2)}</div></div>
      </div>
      <div style={{marginBottom:6,fontSize:11,color:"rgba(255,255,255,0.3)",textTransform:"uppercase",letterSpacing:"0.08em"}}>Status</div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
        {sel("paymentStatus","Payment Status",["Paid","Pending","Overdue"])}
        {sel("zoneStatus","Zone Status",["Active","Inactive","Suspended"])}
        {sel("earningStatus","Earning Status",["Cleared","Pending","On Hold"])}
        {sel("invoiceStatus","Invoice Status",["Sent","Pending","Not Required"])}
      </div>
      <div style={{marginBottom:14}}>
        <div style={{fontSize:10.5,color:"rgba(255,255,255,0.4)",marginBottom:5,fontWeight:500}}>Notes</div>
        <input value={local.notes} onChange={e=>setLocal(p=>({...p,notes:e.target.value}))} placeholder="Add note..."
          style={{width:"100%",background:"rgba(255,255,255,0.07)",border:"0.5px solid rgba(255,255,255,0.15)",borderRadius:8,padding:"9px 12px",color:"#fff",fontSize:12.5,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}>
        {isCeo&&entryData.createdBy?<div style={{fontSize:10.5,color:"rgba(255,255,255,0.25)"}}>Last saved by: <span style={{color:"#a5b4fc",fontWeight:500}}>{entryData.createdBy}</span></div>:<div/>}
        <div style={{display:"flex",gap:8}}>
          <button onClick={onCancel} style={{background:"rgba(255,255,255,0.06)",border:"0.5px solid rgba(255,255,255,0.1)",color:"rgba(255,255,255,0.5)",borderRadius:8,padding:"9px 20px",fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>Cancel</button>
          <button onClick={handleSave} style={{background:"#6366f1",border:"none",borderRadius:8,padding:"9px 28px",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>{saving?"Saving...":"Save ✓"}</button>
        </div>
      </div>
    </div>
  );
}

// ── MINI BAR CHART ──
function MiniBar({ data, color="#6366f1", height=40 }) {
  const max = Math.max(...data.map(d=>d.val), 1);
  return (
    <div style={{display:"flex",alignItems:"flex-end",gap:3,height}}>
      {data.map((d,i)=>(
        <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
          <div style={{width:"100%",background:color,borderRadius:"3px 3px 0 0",height:`${Math.max((d.val/max)*height,2)}px`,opacity:0.85,transition:"height 0.3s"}}></div>
          <div style={{fontSize:8,color:"rgba(255,255,255,0.3)",whiteSpace:"nowrap"}}>{d.label}</div>
        </div>
      ))}
    </div>
  );
}

// ── MAIN APP ──
// ── USER MANAGEMENT COMPONENT ──
function UserManagement({ role, API }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [editUser, setEditUser] = useState(null);
  const [newUser, setNewUser] = useState({username:"",password:"",name:"",role:"admin"});
  const [showNew, setShowNew] = useState(false);

  useEffect(()=>{ fetchUsers(); },[]);

  async function fetchUsers() {
    try {
      const r = await fetch(`${API}/api/users`);
      const d = await r.json();
      if (Array.isArray(d)) setUsers(d);
    } catch(e) {}
  }

  async function updateUser(id, data) {
    if (!data.username?.trim()) return setMsg("❌ Username required!");
    if (!data.password?.trim()) return setMsg("❌ Password required!");
    setLoading(true);
    try {
      const r = await fetch(`${API}/api/users/${id}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)});
      const d = await r.json();
      if (d.success) { setMsg("✅ User updated!"); setEditUser(null); fetchUsers(); }
      else setMsg("❌ "+d.error);
    } catch(e) { setMsg("❌ Error"); }
    setLoading(false);
  }

  async function addUser() {
    if (!newUser.username?.trim()) return setMsg("❌ Username required!");
    if (!newUser.password?.trim()) return setMsg("❌ Password required!");
    if (!newUser.name?.trim()) return setMsg("❌ Name required!");
    setLoading(true);
    try {
      const r = await fetch(`${API}/api/users`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(newUser)});
      const d = await r.json();
      if (d.id) { setMsg("✅ User added!"); setShowNew(false); setNewUser({username:"",password:"",name:"",role:"admin"}); fetchUsers(); }
      else setMsg("❌ "+(d.error||"Error"));
    } catch(e) { setMsg("❌ Error"); }
    setLoading(false);
  }

  async function deleteUser(id) {
    if (!confirm("Delete this user?")) return;
    try {
      await fetch(`${API}/api/users/${id}`,{method:"DELETE"});
      fetchUsers(); setMsg("✅ User deleted!");
    } catch(e) {}
  }

  const inp = (label, val, onChange, type="text") => (
    <div style={{marginBottom:10}}>
      <div style={{fontSize:10.5,color:"rgba(255,255,255,0.4)",marginBottom:4}}>{label}</div>
      <input type={type} value={val} onChange={e=>onChange(e.target.value)} autoComplete="new-password"
        style={{width:"100%",background:"rgba(255,255,255,0.07)",border:"0.5px solid rgba(255,255,255,0.15)",borderRadius:8,padding:"9px 12px",color:"#fff",fontSize:13,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
    </div>
  );

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div style={{fontSize:13,fontWeight:500}}>🔐 User Management</div>
        <button onClick={()=>{setShowNew(!showNew);setMsg("");}} style={{background:"#6366f1",border:"none",borderRadius:8,padding:"7px 16px",color:"#fff",fontSize:12,cursor:"pointer",fontFamily:"inherit",fontWeight:500}}>+ Add User</button>
      </div>

      {msg&&<div style={{fontSize:12,color:msg.includes("✅")?"#86efac":"#f87171",background:msg.includes("✅")?"rgba(34,197,94,0.08)":"rgba(239,68,68,0.08)",border:`0.5px solid ${msg.includes("✅")?"rgba(34,197,94,0.2)":"rgba(239,68,68,0.2)"}`,borderRadius:8,padding:"8px 12px",marginBottom:14}}>{msg}</div>}

      {/* Add new user form */}
      {showNew&&(
        <div style={{background:"#13151f",border:"0.5px solid rgba(99,102,241,0.3)",borderRadius:12,padding:20,marginBottom:16}}>
          <div style={{fontSize:12,fontWeight:500,marginBottom:14,color:"#a5b4fc"}}>New User</div>
          {inp("Full Name","name" in newUser?newUser.name:"",v=>setNewUser({...newUser,name:v}))}
          {inp("Username",newUser.username,v=>setNewUser({...newUser,username:v}))}
          {inp("Password",newUser.password,v=>setNewUser({...newUser,password:v}),"password")}
          <div style={{marginBottom:14}}>
            <div style={{fontSize:10.5,color:"rgba(255,255,255,0.4)",marginBottom:4}}>Role</div>
            <select value={newUser.role} onChange={e=>setNewUser({...newUser,role:e.target.value})} style={{width:"100%",background:"#1a1d2e",border:"0.5px solid rgba(255,255,255,0.15)",borderRadius:8,padding:"9px 12px",color:"#fff",fontSize:13,fontFamily:"inherit",outline:"none"}}>
              <option value="admin">Admin</option>
              <option value="ceo">CEO</option>
            </select>
          </div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={addUser} disabled={loading} style={{background:"#6366f1",border:"none",borderRadius:8,padding:"9px 20px",color:"#fff",fontSize:12,cursor:"pointer",fontFamily:"inherit",fontWeight:500}}>{loading?"Saving...":"Add User"}</button>
            <button onClick={()=>{setShowNew(false);setMsg("");}} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:8,padding:"9px 16px",color:"rgba(255,255,255,0.5)",fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Cancel</button>
          </div>
        </div>
      )}

      {/* Users list */}
      <div style={{background:"#13151f",border:"0.5px solid rgba(255,255,255,0.07)",borderRadius:12,overflow:"hidden"}}>
        <div style={{padding:"12px 16px",borderBottom:"0.5px solid rgba(255,255,255,0.06)"}}>
          <span style={{fontSize:12.5,fontWeight:500}}>All Users ({users.length})</span>
        </div>
        {users.map((u,i)=>(
          <div key={u.id}>
            {editUser?.id===u.id ? (
              <div style={{padding:"14px 16px",borderBottom:"0.5px solid rgba(255,255,255,0.04)",background:"rgba(99,102,241,0.05)"}}>
                <div style={{fontSize:11,color:"#a5b4fc",marginBottom:10,fontWeight:500}}>Editing: {u.name||u.username}</div>
                {inp("Full Name",editUser.name||"",v=>setEditUser({...editUser,name:v}))}
                {inp("Username",editUser.username||"",v=>setEditUser({...editUser,username:v}))}
                {inp("Password (visible for editing)",editUser.password||"",v=>setEditUser({...editUser,password:v}),"text")}
                <div style={{marginBottom:14}}>
                  <div style={{fontSize:10.5,color:"rgba(255,255,255,0.4)",marginBottom:4}}>Role</div>
                  <select value={editUser.role||"admin"} onChange={e=>setEditUser({...editUser,role:e.target.value})} style={{width:"100%",background:"#1a1d2e",border:"0.5px solid rgba(255,255,255,0.15)",borderRadius:8,padding:"9px 12px",color:"#fff",fontSize:13,fontFamily:"inherit",outline:"none"}}>
                    <option value="admin">Admin</option>
                    <option value="ceo">CEO</option>
                  </select>
                </div>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={()=>updateUser(u.id,editUser)} disabled={loading} style={{background:"rgba(34,197,94,0.15)",color:"#86efac",border:"none",borderRadius:7,padding:"7px 16px",fontSize:12,cursor:"pointer",fontFamily:"inherit",fontWeight:500}}>{loading?"Saving...":"Save ✓"}</button>
                  <button onClick={()=>{setEditUser(null);setMsg("");}} style={{background:"rgba(255,255,255,0.06)",color:"rgba(255,255,255,0.5)",border:"none",borderRadius:7,padding:"7px 14px",fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Cancel</button>
                </div>
              </div>
            ) : (
              <div style={{display:"flex",alignItems:"center",padding:"12px 16px",borderBottom:"0.5px solid rgba(255,255,255,0.04)",gap:10}}>
                <div style={{width:34,height:34,borderRadius:9,background:u.role==="ceo"?"linear-gradient(135deg,#6366f1,#8b5cf6)":"linear-gradient(135deg,#22c55e,#16a34a)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:"#fff",flexShrink:0}}>{(u.name||u.username)[0].toUpperCase()}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:500,color:"#fff"}}>{u.name||u.username}</div>
                  <div style={{fontSize:11,color:"rgba(255,255,255,0.4)",marginTop:1}}>@{u.username}</div>
                </div>
                <span style={{fontSize:10,padding:"3px 9px",borderRadius:5,background:u.role==="ceo"?"rgba(99,102,241,0.15)":"rgba(34,197,94,0.12)",color:u.role==="ceo"?"#a5b4fc":"#86efac",fontWeight:500,textTransform:"uppercase"}}>{u.role}</span>
                <button onClick={()=>{setEditUser({...u,password:u.password||""});setMsg("");}} style={{background:"rgba(99,102,241,0.12)",color:"#a5b4fc",border:"none",borderRadius:6,padding:"5px 12px",fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>Edit</button>
                {u.role!=="ceo"&&<button onClick={()=>deleteUser(u.id)} style={{background:"rgba(239,68,68,0.1)",color:"#f87171",border:"none",borderRadius:6,padding:"5px 12px",fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>Delete</button>}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [role, setRole] = useState(null);
  const [username, setUsername] = useState("");
  const [currentUser, setCurrentUser] = useState("");
  const [currentUserName, setCurrentUserName] = useState("");
  const [password, setPassword] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [entries, setEntries] = useState({});
  const [rate, setRate] = useState(376);
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth);
  const [activeDept, setActiveDept] = useState("All");
  const [activeNav, setActiveNav] = useState("dashboard");
  const [activeTab, setActiveTab] = useState("overview");
  const [settingsTab, setSettingsTab] = useState("va");
  const [deptOpen, setDeptOpen] = useState(true);
  const [expandedRow, setExpandedRow] = useState(null);
  const [search, setSearch] = useState("");
  const [vaTrash, setVaTrash] = useState([]);
  const [newVA, setNewVA] = useState({vaName:"",storeName:"",dept:"OnBuy",clientPct:60,agencyPct:20,vaPct:20,bankName:"",accountNo:"",bank:""});
  const [editId, setEditId] = useState(null);
  const [editVA, setEditVA] = useState({});
  const [reportDept, setReportDept] = useState("All");
  const [reportYear, setReportYear] = useState(new Date().getFullYear().toString());
  const [reportView, setReportView] = useState("monthly");
  const [reportEntity, setReportEntity] = useState("dept");
  const [employees, setEmployees] = useState([]);
  const [empTab, setEmpTab] = useState("list");
  const [empSearch, setEmpSearch] = useState("");
  const [vaSearch, setVaSearch] = useState("");
  const [selectedVAId, setSelectedVAId] = useState(null);
  const [empTrash, setEmpTrash] = useState([]);
  const [salaryPayments, setSalaryPayments] = useState([]);
  const [salaryTab, setSalaryTab] = useState({});
  const [selectedEmpId, setSelectedEmpId] = useState(null);
  const [editEmpId, setEditEmpId] = useState(null);
  const [editEmp, setEditEmp] = useState({});
  const [salaryHistory, setSalaryHistory] = useState({});
  const [newSalary, setNewSalary] = useState({effectiveDate:"",salaryPkr:"",salaryGbp:"",reason:""});
  const [newEmp, setNewEmp] = useState({name:"",cnic:"",dob:"",gender:"Male",joiningDate:new Date().toISOString().split("T")[0],designation:"",department:"",employmentType:"Full-time",status:"Active",email:"",phone:"",whatsapp:"",emergencyContact:"",emergencyPhone:"",address:"",city:"",bankName:"",accountNo:"",accountTitle:"",baseSalaryPkr:0,baseSalaryGbp:0,salaryType:"Monthly",notes:""});
  const [clients, setClients] = useState([]);
  const [clientStores, setClientStores] = useState([]);
  const [clientTab, setClientTab] = useState("list");
  const [clientTrash, setClientTrash] = useState([]);
  const [newClient, setNewClient] = useState({name:"",company:"",companyNo:"",email:"",phone:"",address:"",joinDate:new Date().toISOString().split("T")[0],status:"Active",notes:""});
  const [newClientStores, setNewClientStores] = useState([{vaName:"",storeName:"",dept:"OnBuy",clientPct:60,agencyPct:20,vaPct:20,bankName:"",accountNo:"",bank:""}]);
  const [editClientId, setEditClientId] = useState(null);
  const [editClient, setEditClient] = useState({});
  const [editClientStores, setEditClientStores] = useState([]);
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [linkAccountId, setLinkAccountId] = useState("");
  const [emailConfig, setEmailConfig] = useState({user:"",pass:""});
  const [sendingInvoice, setSendingInvoice] = useState(null);
  const [invoicePreview, setInvoicePreview] = useState(null); // {client, type, stores, totals}
  const [expenses, setExpenses] = useState([]);
  const [donations, setDonations] = useState([]);
  const [financeTab, setFinanceTab] = useState("expenses");
  const [expFilter, setExpFilter] = useState("All");
  const [showAddExp, setShowAddExp] = useState(false);
  const [editExpId, setEditExpId] = useState(null);
  const [newExp, setNewExp] = useState({date:new Date().toISOString().split("T")[0],category:"Other",description:"",amountPkr:"",notes:""});
  const [editExp, setEditExp] = useState({});
  const [showAddDon, setShowAddDon] = useState(false);
  const [editDonId, setEditDonId] = useState(null);
  const [newDon, setNewDon] = useState({name:"",address:"",bankName:"",accountNo:"",accountTitle:"",monthlyAmount:"",currency:"PKR",paymentMethod:"Bank Transfer",status:"Active",notes:""});
  const [editDon, setEditDon] = useState({});
  const [activityLog, setActivityLog] = useState([]);
  const [managerDept, setManagerDept] = useState("");
  const [tasks, setTasks] = useState([]);
  const [taskFilter, setTaskFilter] = useState("All");
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({title:"",description:"",priority:"Medium",due_date:"",assigned_to_dept:"OnBuy",assigned_to_manager:"",notes:""});
  const [editTaskId, setEditTaskId] = useState(null);
  const [editTask, setEditTask] = useState({});
  const [managers, setManagers] = useState([]);
  const [showAddMgr, setShowAddMgr] = useState(false);
  const [editMgrId, setEditMgrId] = useState(null);
  const [editMgr, setEditMgr] = useState({});
  const [newMgr, setNewMgr] = useState({name:"",username:"",department:"OnBuy",pin:"",whatsapp:""});
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [whatsappConfig, setWhatsappConfig] = useState({instance_id:"",token:"",enabled:false});
  const chatEndRef = useRef(null);

  // Auto update month
  useEffect(() => {
    const interval = setInterval(() => { setCurrentMonth(getCurrentMonth()); }, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => { if (role==="ceo"||role==="admin") fetchAll(); }, [role]);

  async function fetchAll() {
    try {
      const [ra,re,rr,rt,rc,rcs,rec,rem,rct,rsp,rex,rdn] = await Promise.all([
        fetch(`${API}/api/accounts`),fetch(`${API}/api/entries`),
        fetch(`${API}/api/rate`),fetch(`${API}/api/va-trash`),
        fetch(`${API}/api/clients`),fetch(`${API}/api/client-stores`),
        fetch(`${API}/api/email-config`),fetch(`${API}/api/employees`),
        fetch(`${API}/api/client-trash`),fetch(`${API}/api/salary-payments`),
        fetch(`${API}/api/expenses`),fetch(`${API}/api/donations`)
      ]);
      const [da,de,dr,dt,dc,dcs,dec,dem,dct,dsp,dex,ddn] = await Promise.all([ra.json(),re.json(),rr.json(),rt.json(),rc.json(),rcs.json(),rec.json(),rem.json(),rct.json(),rsp.json(),rex.json(),rdn.json()]);
      if (Array.isArray(da)) setAccounts(da);
      if (de&&typeof de==="object") setEntries(de);
      if (dr.rate) setRate(Number(dr.rate));
      if (Array.isArray(dt)) setVaTrash(dt);
      if (Array.isArray(dc)) setClients(dc);
      if (Array.isArray(dcs)) setClientStores(dcs);
      if (dec) setEmailConfig(dec);
      if (Array.isArray(dem)) setEmployees(dem);
      if (Array.isArray(dct)) setClientTrash(dct.map(c=>({...c,expiresAt:c.expires_at,deletedAt:c.deleted_at})));
      if (Array.isArray(dsp)) setSalaryPayments(dsp);
      if (Array.isArray(dex)) setExpenses(dex);
      if (Array.isArray(ddn)) setDonations(ddn);
    } catch(e) {}
  }

  async function fetchActivityLog() {
    try { const r=await fetch(`${API}/api/activity-log`); const d=await r.json(); if(Array.isArray(d)) setActivityLog(d); } catch(e) {}
  }

  async function fetchTasks(dept, manager) {
    try {
      let url = `${API}/api/tasks`;
      if(manager) url+=`?manager=${encodeURIComponent(manager)}`;
      else if(dept&&dept!=="All") url+=`?dept=${encodeURIComponent(dept)}`;
      const r = await fetch(url); const d = await r.json(); if(Array.isArray(d)) setTasks(d);
    } catch(e) {}
  }

  async function fetchManagers() {
    try { const r=await fetch(`${API}/api/managers`); const d=await r.json(); if(Array.isArray(d)) setManagers(d); } catch(e) {}
  }

  async function fetchChat() {
    try { const r=await fetch(`${API}/api/chat`); const d=await r.json(); if(Array.isArray(d)){ setChatMessages(d); setTimeout(()=>chatEndRef.current?.scrollIntoView({behavior:"smooth"}),50); } } catch(e) {}
  }

  async function sendChat() {
    if(!chatInput.trim()) return;
    try {
      const r=await fetch(`${API}/api/chat`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({from_username:currentUser,from_name:currentUserName||currentUser,from_role:role,message:chatInput.trim()})});
      const d=await r.json();
      if(d.id){ setChatMessages(p=>[...p,d]); setChatInput(""); setTimeout(()=>chatEndRef.current?.scrollIntoView({behavior:"smooth"}),50); }
    } catch(e) {}
  }

  async function fetchWhatsappConfig() {
    try { const r=await fetch(`${API}/api/whatsapp-config`); const d=await r.json(); setWhatsappConfig(d); } catch(e) {}
  }

  useEffect(()=>{ if(activeNav==="history"&&role==="ceo") fetchActivityLog(); },[activeNav]);
  useEffect(()=>{ if(activeNav==="tasks"&&(role==="ceo"||role==="admin")) fetchTasks("All"); },[activeNav]);
  useEffect(()=>{ if(activeNav==="tasks"&&(role==="ceo"||role==="admin")) fetchManagers(); },[activeNav]);
  useEffect(()=>{ if(role==="manager"&&managerDept&&currentUser) fetchTasks(managerDept,currentUser); },[role,managerDept,currentUser]);
  useEffect(()=>{ if(settingsTab==="managers"&&role==="ceo") fetchManagers(); },[settingsTab]);
  useEffect(()=>{ if(settingsTab==="whatsapp"&&role==="ceo") fetchWhatsappConfig(); },[settingsTab]);
  useEffect(()=>{
    if(activeNav==="chat"&&(role==="ceo"||role==="admin")){ fetchChat(); const id=setInterval(fetchChat,5000); return()=>clearInterval(id); }
  },[activeNav,role]);
  useEffect(()=>{
    if(showChat){ fetchChat(); const id=setInterval(fetchChat,5000); return()=>clearInterval(id); }
  },[showChat]);

  function entryKey(id, month) { return `${id}_${month||currentMonth}`; }
  function getEntry(id, month) { return entries[entryKey(id,month)]||{}; }

  const saveEntryToDB = useCallback(async (id, data) => {
    const key = `${id}_${currentMonth}`;
    const merged = {...(entries[key]||{}),...data,createdBy:currentUser};
    try {
      const r = await fetch(`${API}/api/entries`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({key,data:merged})});
      const d = await r.json();
      if (!r.ok||d.error) { alert(`Save failed: ${d.error||r.status}`); return; }
      setEntries(prev=>({...prev,[key]:merged}));
      setExpandedRow(null);
    } catch(e) { alert("Save failed — check your connection and try again"); }
  }, [currentMonth, currentUser, entries]);

  function calcRow(acc, month) {
    const e = getEntry(acc.id, month);
    const profit = parseFloat(e.totalProfit)||0;
    const totalPenGBP = (parseFloat(e.hmrcFee)||0)+(parseFloat(e.counterfeit)||0)+(parseFloat(e.leavesPenalty)||0)+(parseFloat(e.feedbackDed)||0)+(parseFloat(e.lateArrival)||0)+(parseFloat(e.warningPenalty)||0)+(parseFloat(e.otherPenalty)||0);
    const agGBP = profit*((acc.agencyPct||20)/100);
    const vaGross = profit*((acc.vaPct||20)/100);
    const vaGBP = vaGross - totalPenGBP;
    return {profit, totalPenGBP, netProfit:agGBP+vaGBP, vaGBP, agGBP};
  }

  function getDeptAccounts(dept) { return dept==="All"?accounts:accounts.filter(a=>a.dept===dept); }

  function getStats(dept, month) {
    const accs = getDeptAccounts(dept);
    let totalProfit=0, totalAgency=0, totalVA=0, totalPen=0;
    accs.forEach(a=>{ const c=calcRow(a,month); totalProfit+=c.profit; totalAgency+=c.agGBP; totalVA+=c.vaGBP; totalPen+=c.totalPenGBP; });
    return {totalProfit, totalAgency, totalVA, totalPen, count:accs.length};
  }

  // ── ANALYTICS ──
  function getMonthlyData(year) {
    return Array.from({length:12},(_,i)=>{
      const m = `${year}-${String(i+1).padStart(2,"0")}`;
      const s = getStats(reportDept, m);
      return {label:SHORT_MONTHS[i], val:s.totalProfit, agency:s.totalAgency, va:s.totalVA, pen:s.totalPen, month:m};
    });
  }

  function getYearlyData() {
    return ["2024","2025","2026","2027"].map(y=>{
      let total=0;
      for(let i=1;i<=12;i++){
        const m=`${y}-${String(i).padStart(2,"0")}`;
        total+=getStats(reportDept,m).totalProfit;
      }
      return {label:y, val:total};
    });
  }

  function getBestVA(month) {
    let best=null, bestVal=0;
    accounts.forEach(a=>{ const c=calcRow(a,month); if(c.profit>bestVal){bestVal=c.profit;best=a;} });
    return best?{...best, profit:bestVal}:null;
  }

  function getBestStore(month) {
    let best=null, bestVal=0;
    accounts.forEach(a=>{ const c=calcRow(a,month); if(c.profit>bestVal){bestVal=c.profit;best=a;} });
    return best?{...best, profit:bestVal}:null;
  }

  function getBestDept(month) {
    let best=null, bestVal=0;
    DEPTS.filter(d=>d!=="All").forEach(d=>{ const s=getStats(d,month); if(s.totalProfit>bestVal){bestVal=s.totalProfit;best=d;} });
    return {dept:best, profit:bestVal};
  }

  function getLastMonth() {
    const [y,m] = currentMonth.split("-");
    const date = new Date(parseInt(y), parseInt(m)-2, 1);
    return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}`;
  }

  const lastMonth = getLastMonth();
  const thisStats = getStats(activeDept, currentMonth);
  const lastStats = getStats(activeDept, lastMonth);
  const monthlyData = useMemo(()=>getMonthlyData(reportYear), [entries, reportYear, reportDept]);
  const yearlyData = useMemo(()=>getYearlyData(), [entries, reportDept]);

  function pctChange(curr, prev) {
    if(!prev) return null;
    const pct = ((curr-prev)/prev)*100;
    return pct;
  }

  const filteredAccounts = accounts.filter(a=>{
    const dm = activeNav==="settings"||activeDept==="All"||a.dept===activeDept;
    const sm = !search||a.vaName.toLowerCase().includes(search.toLowerCase())||a.storeName.toLowerCase().includes(search.toLowerCase());
    return dm&&sm;
  });

  const [selYear, selMonth] = currentMonth.split("-");

  // ── VA MANAGEMENT ──
  async function addAccount() {
    if (!newVA.vaName.trim()||!newVA.storeName.trim()) return alert("VA Name and Store Name required!");
    try {
      const r = await fetch(`${API}/api/accounts`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(newVA)});
      const d = await r.json();
      setAccounts(prev=>[...prev,d]);
      setNewVA({vaName:"",storeName:"",dept:"OnBuy",clientPct:60,agencyPct:20,vaPct:20,bankName:"",accountNo:"",bank:""});
    } catch(e) { alert("Error adding VA"); }
  }

  async function deleteAccount(id) {
    if (!confirm("Move this VA to trash?")) return;
    const acc = accounts.find(a=>a.id===id); if (!acc) return;
    try {
      const tr = await fetch(`${API}/api/va-trash`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:acc.id,vaName:acc.vaName,storeName:acc.storeName,dept:acc.dept,clientPct:acc.clientPct,agencyPct:acc.agencyPct,vaPct:acc.vaPct,bankName:acc.bankName||"",accountNo:acc.accountNo||"",bank:acc.bank||""})});
      if (tr.ok) {
        await fetch(`${API}/api/accounts/${id}`,{method:"DELETE"});
        setAccounts(prev=>prev.filter(a=>a.id!==id));
        setVaTrash(prev=>[...prev,{...acc,expiresAt:new Date(Date.now()+30*24*60*60*1000).toISOString()}]);
        alert(`${acc.vaName} moved to trash ✓`);
      }
    } catch(e) { alert("Error"); }
  }

  async function restoreVA(item) {
    try {
      const r = await fetch(`${API}/api/accounts`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({vaName:item.vaName,storeName:item.storeName,dept:item.dept,clientPct:item.clientPct,agencyPct:item.agencyPct,vaPct:item.vaPct,bankName:item.bankName||"",accountNo:item.accountNo||"",bank:item.bank||""})});
      const d = await r.json();
      await fetch(`${API}/api/va-trash/${item.id}`,{method:"DELETE"});
      setAccounts(prev=>[...prev,d]);
      setVaTrash(prev=>prev.filter(x=>x.id!==item.id));
      alert(`${item.vaName} restored ✓`);
    } catch(e) { alert("Error"); }
  }

  async function saveEdit(id) {
    try {
      await fetch(`${API}/api/accounts/${id}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(editVA)});
      setAccounts(prev=>prev.map(a=>a.id===id?{...a,...editVA}:a));
      setEditId(null); setEditVA({});
    } catch(e) {}
  }

  async function saveAdminEntry(id, field, value) {
    const key = entryKey(id);
    setEntries(prev=>{
      const updated={...prev,[key]:{...(prev[key]||{}),[field]:value}};
      fetch(`${API}/api/entries`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({key,data:updated[key]})}).catch(()=>{});
      return updated;
    });
  }

  // ── STYLES ──
  const card = {background:"#13151f",border:"0.5px solid rgba(255,255,255,0.07)",borderRadius:12,padding:16};
  const kpiCard = (color) => ({...card,position:"relative",overflow:"hidden"});

  function Arrow({pct}) {
    if(pct===null) return <span style={{fontSize:11,color:"rgba(255,255,255,0.3)"}}>No data</span>;
    const up = pct>=0;
    return <span style={{fontSize:11,color:up?"#86efac":"#f87171",fontWeight:500}}>{up?"↑":"↓"} {Math.abs(pct).toFixed(1)}% vs last month</span>;
  }

  // ── LOGIN ──
  async function handleLogin() {
    if (!username.trim()||!password.trim()) { setLoginErr("Username and password required!"); return; }
    setLoginLoading(true);
    try {
      const r = await fetch(`${API}/api/login`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username:username.trim(),password})});
      const d = await r.json();
      if (d.success) {
        setCurrentUser(username.trim()); setCurrentUserName(d.name||username.trim()); setRole(d.role); setUsername(""); setPassword(""); setLoginErr("");
        if(d.department) setManagerDept(d.department);
        setActiveNav(d.role==="ceo"?"dashboard":d.role==="manager"?"tasks":"monthly");
      } else { setLoginErr(d.message||"Invalid username or password"); }
    } catch(e) { setLoginErr("Connection error — try again"); }
    setLoginLoading(false);
  }

  if (!role) return (
    <div style={{minHeight:"100vh",background:"#0a0b11",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Inter,system-ui,sans-serif"}}>
      <div style={{background:"#13151f",border:"0.5px solid rgba(255,255,255,0.08)",borderRadius:16,padding:"40px 36px",width:380,textAlign:"center"}}>
        <div style={{width:52,height:52,borderRadius:13,background:"linear-gradient(135deg,#6366f1,#8b5cf6)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,fontWeight:700,color:"#fff",margin:"0 auto 20px"}}>EM</div>
        <div style={{fontSize:21,fontWeight:600,color:"#fff",marginBottom:6,letterSpacing:"-0.03em"}}>E-Commerce Maneka</div>
        <div style={{fontSize:12,color:"rgba(255,255,255,0.35)",marginBottom:28}}>ERP System — Secure Login</div>

        {/* Username */}
        <div style={{marginBottom:12,textAlign:"left"}}>
          <div style={{fontSize:11,color:"rgba(255,255,255,0.4)",marginBottom:6,fontWeight:500}}>USERNAME</div>
          <input
            type="text" placeholder="Enter username" value={username}
            onChange={e=>{setUsername(e.target.value);setLoginErr("");}}
            onKeyDown={e=>e.key==="Enter"&&handleLogin()}
            autoComplete="off"
            style={{width:"100%",background:"rgba(255,255,255,0.06)",border:"0.5px solid rgba(255,255,255,0.12)",borderRadius:10,padding:"11px 14px",color:"#fff",fontSize:14,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
        </div>

        {/* Password */}
        <div style={{marginBottom:loginErr?12:20,textAlign:"left"}}>
          <div style={{fontSize:11,color:"rgba(255,255,255,0.4)",marginBottom:6,fontWeight:500}}>PASSWORD</div>
          <input
            type="password" placeholder="Enter password" value={password}
            onChange={e=>{setPassword(e.target.value);setLoginErr("");}}
            onKeyDown={e=>e.key==="Enter"&&handleLogin()}
            autoComplete="new-password"
            style={{width:"100%",background:"rgba(255,255,255,0.06)",border:"0.5px solid rgba(255,255,255,0.12)",borderRadius:10,padding:"11px 14px",color:"#fff",fontSize:14,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
        </div>

        {loginErr&&<div style={{fontSize:12,color:"#f87171",marginBottom:14,textAlign:"left",background:"rgba(239,68,68,0.08)",padding:"8px 12px",borderRadius:7}}>{loginErr}</div>}

        <button onClick={handleLogin} disabled={loginLoading}
          style={{width:"100%",background:"#6366f1",border:"none",borderRadius:10,padding:"12px",color:"#fff",fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"inherit",opacity:loginLoading?0.7:1}}>
          {loginLoading?"Logging in...":"Login"}
        </button>
        <div style={{marginTop:20,fontSize:11,color:"rgba(255,255,255,0.15)"}}>E-Commerce Maneka ERP v2.0</div>
      </div>
    </div>
  );

  // ── ADMIN ──
  if (role==="admin") {
    // Admin uses same ERP but with restricted nav
    // Fall through to main CEO ERP below
  }

  // ── TASK HELPERS ──
  const PRTY_C = {Low:"#22c55e",Medium:"#f59e0b",High:"#f97316",Urgent:"#ef4444"};
  const STAT_C = {Pending:"#6366f1","In Progress":"#0ea5e9",Completed:"#22c55e",Overdue:"#ef4444"};
  const effSt = (t) => { if(t.status==="Completed")return"Completed"; if(t.due_date){const d=new Date(t.due_date+"T00:00:00"),now=new Date();now.setHours(0,0,0,0);if(d<now)return"Overdue";}return t.status; };

  // ── MANAGER VIEW ──
  if (role==="manager") {
    const mc = DEPT_COLORS[managerDept]||"#6366f1";
    const ms = {total:tasks.length,pending:tasks.filter(t=>effSt(t)==="Pending").length,inProgress:tasks.filter(t=>effSt(t)==="In Progress").length,completed:tasks.filter(t=>effSt(t)==="Completed").length,overdue:tasks.filter(t=>effSt(t)==="Overdue").length};
    return (
      <div style={{minHeight:"100vh",background:"#0a0b11",color:"#fff",fontFamily:"Inter,system-ui,sans-serif",display:"flex",flexDirection:"column"}}>
        <div style={{background:"#13151f",borderBottom:"0.5px solid rgba(255,255,255,0.06)",padding:"14px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:34,height:34,borderRadius:9,background:"linear-gradient(135deg,#6366f1,#8b5cf6)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700}}>EM</div>
            <div>
              <div style={{fontSize:14,fontWeight:600}}>Task Manager</div>
              <div style={{fontSize:11,color:mc,fontWeight:500}}>{managerDept} Department</div>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:12,color:"rgba(255,255,255,0.4)"}}>Logged in as <span style={{color:"#fff",fontWeight:500}}>{currentUserName||currentUser}</span></span>
            <button onClick={()=>{setShowChat(true);}} style={{background:"rgba(99,102,241,0.1)",border:"0.5px solid rgba(99,102,241,0.3)",color:"#a5b4fc",borderRadius:7,padding:"6px 14px",fontSize:11.5,cursor:"pointer",fontFamily:"inherit",fontWeight:500}}>💬 Chat</button>
            <button onClick={()=>{setRole(null);setManagerDept("");setTasks([]);setShowChat(false);}} style={{background:"rgba(239,68,68,0.08)",border:"0.5px solid rgba(239,68,68,0.2)",color:"#f87171",borderRadius:7,padding:"6px 14px",fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>Logout</button>
          </div>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"20px 28px"}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,marginBottom:20}}>
            {[["Total",ms.total,"#6366f1"],["Pending",ms.pending,"#6366f1"],["In Progress",ms.inProgress,"#0ea5e9"],["Completed",ms.completed,"#22c55e"],["Overdue",ms.overdue,"#ef4444"]].map(([lbl,val,c])=>(
              <div key={lbl} style={{background:"#13151f",border:`0.5px solid ${c}30`,borderRadius:10,padding:"14px 16px"}}>
                <div style={{fontSize:10,color:"rgba(255,255,255,0.35)",textTransform:"uppercase",letterSpacing:"0.07em"}}>{lbl}</div>
                <div style={{fontSize:24,fontWeight:700,color:c,marginTop:4}}>{val}</div>
              </div>
            ))}
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {tasks.length===0&&<div style={{textAlign:"center",padding:40,color:"rgba(255,255,255,0.2)",fontSize:13}}>No tasks for {managerDept} yet.</div>}
            {tasks.map(t=>{
              const st=effSt(t);const sc=STAT_C[st]||"#6366f1";const pc=PRTY_C[t.priority]||"#f59e0b";const isEd=editTaskId===t.id;
              return (
                <div key={t.id} style={{background:"#13151f",border:"0.5px solid rgba(255,255,255,0.07)",borderRadius:12,padding:"16px 18px"}}>
                  {isEd?(
                    <div>
                      <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr",gap:8,marginBottom:8}}>
                        <input value={editTask.title||""} onChange={e=>setEditTask(p=>({...p,title:e.target.value}))} style={{background:"rgba(255,255,255,0.07)",border:"0.5px solid rgba(255,255,255,0.15)",borderRadius:7,padding:"7px 10px",color:"#fff",fontSize:13,outline:"none",fontFamily:"inherit"}}/>
                        <select value={editTask.priority||"Medium"} onChange={e=>setEditTask(p=>({...p,priority:e.target.value}))} style={{background:"#1a1d2e",border:"0.5px solid rgba(255,255,255,0.15)",borderRadius:7,padding:"7px 10px",color:"#fff",fontSize:12,fontFamily:"inherit",outline:"none"}}>{["Low","Medium","High","Urgent"].map(p=><option key={p} value={p}>{p}</option>)}</select>
                        <input type="date" value={editTask.due_date||""} onChange={e=>setEditTask(p=>({...p,due_date:e.target.value}))} style={{background:"rgba(255,255,255,0.07)",border:"0.5px solid rgba(255,255,255,0.15)",borderRadius:7,padding:"7px 10px",color:"#fff",fontSize:12,outline:"none",fontFamily:"inherit",colorScheme:"dark"}}/>
                      </div>
                      <div style={{marginBottom:8}}><select value={editTask.status||"Pending"} onChange={e=>setEditTask(p=>({...p,status:e.target.value}))} style={{background:"#1a1d2e",border:"0.5px solid rgba(255,255,255,0.15)",borderRadius:7,padding:"7px 10px",color:"#fff",fontSize:12,fontFamily:"inherit",outline:"none"}}>{["Pending","In Progress","Completed"].map(s=><option key={s} value={s}>{s}</option>)}</select></div>
                      <textarea value={editTask.description||""} onChange={e=>setEditTask(p=>({...p,description:e.target.value}))} rows={2} style={{width:"100%",background:"rgba(255,255,255,0.07)",border:"0.5px solid rgba(255,255,255,0.15)",borderRadius:7,padding:"7px 10px",color:"#fff",fontSize:12,outline:"none",fontFamily:"inherit",boxSizing:"border-box",resize:"vertical",marginBottom:8}}/>
                      <div style={{display:"flex",gap:8}}>
                        <button onClick={async()=>{try{const ca=editTask.status==="Completed"&&t.status!=="Completed"?new Date().toISOString():t.completed_at||null;await fetch(`${API}/api/tasks/${t.id}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({...editTask,completed_at:ca})});setTasks(p=>p.map(x=>x.id===t.id?{...x,...editTask,completed_at:ca}:x));setEditTaskId(null);}catch(e){}}} style={{background:"rgba(34,197,94,0.15)",color:"#86efac",border:"none",borderRadius:7,padding:"6px 16px",fontSize:12,cursor:"pointer",fontFamily:"inherit",fontWeight:500}}>Save ✓</button>
                        <button onClick={()=>setEditTaskId(null)} style={{background:"rgba(255,255,255,0.06)",color:"rgba(255,255,255,0.5)",border:"none",borderRadius:7,padding:"6px 14px",fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Cancel</button>
                      </div>
                    </div>
                  ):(
                    <div style={{display:"flex",alignItems:"flex-start",gap:12}}>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                          <span style={{fontSize:14,fontWeight:600}}>{t.title}</span>
                          <span style={{fontSize:10,padding:"2px 8px",borderRadius:5,background:`${sc}18`,color:sc,fontWeight:600}}>{st}</span>
                          <span style={{fontSize:10,padding:"2px 8px",borderRadius:5,background:`${pc}18`,color:pc,fontWeight:600}}>{t.priority}</span>
                        </div>
                        {t.description&&<div style={{fontSize:12,color:"rgba(255,255,255,0.45)",marginBottom:4}}>{t.description}</div>}
                        <div style={{display:"flex",gap:16,fontSize:11,color:"rgba(255,255,255,0.3)"}}>
                          {t.due_date&&<span style={{color:st==="Overdue"?"#f87171":"inherit"}}>Due: {new Date(t.due_date+"T00:00:00").toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})}</span>}
                          {t.assigned_by&&<span>By: {t.assigned_by}</span>}
                          <span>Created: {new Date(t.created_at).toLocaleDateString("en-GB",{day:"2-digit",month:"short"})}</span>
                        </div>
                      </div>
                      <div style={{display:"flex",gap:8,flexShrink:0}}>
                        {t.status!=="Completed"&&<button onClick={async()=>{const ns=t.status==="Pending"?"In Progress":"Completed";const ca=ns==="Completed"?new Date().toISOString():null;try{await fetch(`${API}/api/tasks/${t.id}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({title:t.title,description:t.description||"",assigned_by:t.assigned_by,assigned_to_dept:t.assigned_to_dept,priority:t.priority,status:ns,due_date:t.due_date,notes:t.notes||"",completed_at:ca})});setTasks(p=>p.map(x=>x.id===t.id?{...x,status:ns,completed_at:ca}:x));}catch(e){}}} style={{background:t.status==="Pending"?"rgba(14,165,233,0.12)":"rgba(34,197,94,0.12)",color:t.status==="Pending"?"#38bdf8":"#86efac",border:"none",borderRadius:7,padding:"6px 14px",fontSize:11.5,cursor:"pointer",fontFamily:"inherit",fontWeight:500}}>{t.status==="Pending"?"→ In Progress":"✓ Complete"}</button>}
                        <button onClick={()=>{setEditTaskId(t.id);setEditTask({title:t.title,description:t.description||"",priority:t.priority,status:t.status,due_date:t.due_date?t.due_date.split("T")[0]:"",notes:t.notes||"",assigned_to_dept:t.assigned_to_dept,completed_at:t.completed_at});}} style={{background:"rgba(99,102,241,0.12)",color:"#a5b4fc",border:"none",borderRadius:7,padding:"6px 12px",fontSize:11.5,cursor:"pointer",fontFamily:"inherit"}}>Edit</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        {showChat&&(
          <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.78)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
            <div style={{background:"#13151f",border:"0.5px solid rgba(99,102,241,0.3)",borderRadius:16,width:"100%",maxWidth:520,height:"72vh",display:"flex",flexDirection:"column"}}>
              <div style={{padding:"16px 20px",borderBottom:"0.5px solid rgba(255,255,255,0.07)",display:"flex",alignItems:"center",justifyContent:"space-between",flexShrink:0}}>
                <div style={{fontSize:14,fontWeight:600}}>💬 Team Chat</div>
                <button onClick={()=>setShowChat(false)} style={{background:"rgba(255,255,255,0.06)",border:"none",color:"rgba(255,255,255,0.5)",borderRadius:8,padding:"5px 12px",fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>✕ Close</button>
              </div>
              <div style={{flex:1,overflowY:"auto",padding:"12px 16px",display:"flex",flexDirection:"column",gap:8}}>
                {chatMessages.length===0&&<div style={{textAlign:"center",color:"rgba(255,255,255,0.2)",fontSize:13,marginTop:40}}>No messages yet. Start the conversation!</div>}
                {chatMessages.map((msg,i)=>{
                  const isMe=msg.from_username===currentUser;
                  const rc=msg.from_role==="ceo"?"#6366f1":msg.from_role==="admin"?"#22c55e":"#f97316";
                  return (
                    <div key={msg.id||i} style={{display:"flex",flexDirection:"column",alignItems:isMe?"flex-end":"flex-start"}}>
                      <div style={{fontSize:10,color:"rgba(255,255,255,0.3)",marginBottom:2}}>{isMe?"You":msg.from_name}<span style={{color:rc,fontSize:9,textTransform:"uppercase",fontWeight:600,marginLeft:5}}>{isMe?"":msg.from_role}</span> · {new Date(msg.created_at).toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"})}</div>
                      <div style={{background:isMe?"rgba(99,102,241,0.18)":"rgba(255,255,255,0.06)",border:`0.5px solid ${isMe?"rgba(99,102,241,0.3)":"rgba(255,255,255,0.07)"}`,borderRadius:10,padding:"8px 12px",maxWidth:"80%",fontSize:13,lineHeight:"1.5",color:isMe?"#c7d2fe":"#fff",wordBreak:"break-word"}}>{msg.message}</div>
                    </div>
                  );
                })}
                <div ref={chatEndRef}/>
              </div>
              <div style={{padding:"12px 16px",borderTop:"0.5px solid rgba(255,255,255,0.07)",display:"flex",gap:8,flexShrink:0}}>
                <input value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendChat()} placeholder="Type a message..." style={{flex:1,background:"rgba(255,255,255,0.07)",border:"0.5px solid rgba(255,255,255,0.15)",borderRadius:8,padding:"9px 12px",color:"#fff",fontSize:13,outline:"none",fontFamily:"inherit"}}/>
                <button onClick={sendChat} style={{background:"#6366f1",border:"none",borderRadius:8,padding:"9px 18px",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Send</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── SIDEBAR ──
  const Sidebar = (
    <div style={{width:236,background:"#0a0b11",borderRight:"0.5px solid rgba(255,255,255,0.05)",display:"flex",flexDirection:"column",flexShrink:0}}>
      <div style={{padding:"18px 16px 14px",borderBottom:"0.5px solid rgba(255,255,255,0.05)"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:34,height:34,borderRadius:9,background:"linear-gradient(135deg,#6366f1,#8b5cf6)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:"#fff",flexShrink:0}}>EM</div>
          <div>
            <div style={{fontSize:13,fontWeight:600,color:"#fff",letterSpacing:"-0.02em"}}>E-Commerce Maneka</div>
            <div style={{fontSize:10,color:role==="admin"?"#22c55e":"#f59e0b",marginTop:1,fontWeight:500}}>{role==="admin"?"Admin Portal":"CEO Dashboard"}</div>
          </div>
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"8px 0"}}>
        {role==="ceo"&&(<>
        <div style={{fontSize:9.5,fontWeight:600,color:"rgba(255,255,255,0.2)",letterSpacing:"0.12em",textTransform:"uppercase",padding:"12px 16px 4px"}}>Departments</div>
        <div onClick={()=>setDeptOpen(!deptOpen)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 16px",cursor:"pointer",color:"rgba(255,255,255,0.4)",fontSize:12.5}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{fontSize:14}}>🏪</span> All Departments</div>
          <span style={{fontSize:10,color:"rgba(255,255,255,0.2)",display:"inline-block",transform:deptOpen?"rotate(90deg)":"rotate(0deg)",transition:"transform 0.2s"}}>›</span>
        </div>
        {deptOpen && DEPTS.map(d=>{
          const isActive=activeDept===d;
          const color=d==="All"?"#6366f1":(DEPT_COLORS[d]||"#6366f1");
          return (
            <div key={d} onClick={()=>{setActiveDept(d);if(activeNav!=="settings"&&activeNav!=="reports")setActiveNav("dashboard");setActiveTab("overview");setSelectedClientId(null);}}
              style={{display:"flex",alignItems:"center",gap:9,padding:"7px 16px 7px 38px",fontSize:12,cursor:"pointer",borderLeft:isActive?`2px solid ${color}`:"2px solid transparent",background:isActive?`${color}12`:"transparent",color:isActive?"#e0e7ff":"rgba(255,255,255,0.35)",fontWeight:isActive?500:400,transition:"all 0.12s"}}>
              <div style={{width:6,height:6,borderRadius:"50%",background:d==="All"?"#6366f1":(DEPT_COLORS[d]||"#888"),flexShrink:0}}></div>{d}
            </div>
          );
        })}
        </>)}
        <div style={{fontSize:9.5,fontWeight:600,color:"rgba(255,255,255,0.2)",letterSpacing:"0.12em",textTransform:"uppercase",padding:"12px 16px 4px",marginTop:4}}>Workspace</div>
        {(role==="ceo"?[
          {id:"dashboard",icon:"📊",label:"Dashboard"},
          {id:"monthly",icon:"📅",label:"Monthly Sheet"},
          {id:"reports",icon:"📈",label:"Analytics & Reports"},
          {id:"clients",icon:"👤",label:"Clients"},
          {id:"employees",icon:"👥",label:"Employees"},
          {id:"finance",icon:"💰",label:"Finance"},
          {id:"tasks",icon:"✅",label:"Tasks"},
          {id:"chat",icon:"💬",label:"Chat"},
          {id:"history",icon:"🕓",label:"History"},
          {id:"settings",icon:"⚙️",label:"Settings"}
        ]:[
          {id:"monthly",icon:"📅",label:"Monthly Sheet"},
          {id:"clients",icon:"👤",label:"Clients"},
          {id:"employees",icon:"👥",label:"Employees"},
          {id:"finance",icon:"💰",label:"Finance"},
          {id:"tasks",icon:"✅",label:"Tasks"},
          {id:"chat",icon:"💬",label:"Chat"},
          {id:"settings",icon:"⚙️",label:"Settings"}
        ]).map(nav=>{
          const isActive=activeNav===nav.id;
          return (
            <div key={nav.id} onClick={()=>{setActiveNav(nav.id);setSelectedClientId(null);if(nav.id==="employees"&&role==="admin")setEmpTab("va");}}
              style={{display:"flex",alignItems:"center",gap:9,padding:"8px 16px",fontSize:12.5,cursor:"pointer",borderLeft:isActive?"2px solid #6366f1":"2px solid transparent",background:isActive?"rgba(99,102,241,0.1)":"transparent",color:isActive?"#fff":"rgba(255,255,255,0.4)",fontWeight:isActive?500:400,transition:"all 0.14s"}}>
              <span style={{fontSize:14}}>{nav.icon}</span>{nav.label}
            </div>
          );
        })}
      </div>
      <div style={{padding:"0 16px 14px"}}>
        <button onClick={()=>setRole(null)} style={{width:"100%",background:"rgba(239,68,68,0.08)",border:"0.5px solid rgba(239,68,68,0.2)",color:"#f87171",borderRadius:8,padding:7,fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>Logout</button>
      </div>
    </div>
  );

  // ── TOPBAR ──
  const Topbar = (
    <div style={{padding:"18px 26px 0",display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexShrink:0}}>
      <div>
        <div style={{fontSize:11,color:"rgba(255,255,255,0.28)",marginBottom:5}}>🏠 › {activeNav==="dashboard"?"Dashboard":activeNav==="monthly"?"Monthly Sheet":activeNav==="reports"?"Analytics & Reports":activeNav==="clients"?"Clients":activeNav==="employees"?"Employees":activeNav==="finance"?"Finance":activeNav==="tasks"?"Tasks":activeNav==="chat"?"Chat":activeNav==="history"?"History":"Settings"}{activeDept!=="All"?` › ${activeDept}`:""}</div>
        <div style={{fontSize:21,fontWeight:600,letterSpacing:"-0.03em"}}>{activeDept==="All"?"All Departments":activeDept}</div>
        <div style={{fontSize:12,color:"rgba(255,255,255,0.35)",marginTop:3}}>
          <span style={{display:"inline-block",width:6,height:6,borderRadius:"50%",background:"#22c55e",marginRight:5,verticalAlign:"middle"}}></span>
          Live · {MONTHS[parseInt(selMonth)-1]} {selYear}
        </div>
      </div>
      <div style={{display:"flex",gap:8,alignItems:"center"}}>
        <select value={selYear} onChange={e=>setCurrentMonth(`${e.target.value}-${selMonth}`)}
          style={{background:"#6366f1",border:"none",color:"#fff",fontSize:12,padding:"6px 12px",borderRadius:8,fontFamily:"inherit",outline:"none",cursor:"pointer",fontWeight:600,minWidth:80}}>
          {["2024","2025","2026","2027"].map(y=>(
            <option key={y} value={y} style={{background: y==="2024"?"#3b82f6":y==="2025"?"#8b5cf6":y==="2026"?"#6366f1":"#ec4899",color:"#fff",fontWeight:600}}>{y}</option>
          ))}
        </select>
        <select value={selMonth} onChange={e=>setCurrentMonth(`${selYear}-${e.target.value}`)}
          style={{background:MONTH_COLORS[parseInt(selMonth)-1],border:"none",color:"#fff",fontSize:12,padding:"6px 12px",borderRadius:8,fontFamily:"inherit",outline:"none",cursor:"pointer",fontWeight:600,minWidth:110}}>
          {MONTHS.map((m,i)=>(
            <option key={m} value={String(i+1).padStart(2,"0")} style={{background:MONTH_COLORS[i],color:"#fff",fontWeight:600}}>{m}</option>
          ))}
        </select>
      </div>
    </div>
  );

  // ── DASHBOARD ──
  const bestVA = getBestVA(currentMonth);
  const bestDept = getBestDept(currentMonth);
  const profitChange = pctChange(thisStats.totalProfit, lastStats.totalProfit);
  const agencyChange = pctChange(thisStats.totalAgency, lastStats.totalAgency);

  const Dashboard = (
    <div style={{flex:1,overflowY:"auto",padding:"16px 26px"}}>
      <div style={{display:"flex",gap:2,marginBottom:18,borderBottom:"0.5px solid rgba(255,255,255,0.06)"}}>
        {[["overview","Overview"],["va-list","VA List"]].map(([t,lbl])=>(
          <button key={t} onClick={()=>setActiveTab(t)} style={{padding:"8px 18px",fontSize:12.5,cursor:"pointer",color:activeTab===t?"#fff":"rgba(255,255,255,0.35)",borderBottom:activeTab===t?"2px solid #6366f1":"2px solid transparent",background:"none",border:"none",borderBottom:activeTab===t?"2px solid #6366f1":"2px solid transparent",fontFamily:"inherit",fontWeight:activeTab===t?500:400,marginBottom:-0.5}}>{lbl}</button>
        ))}
      </div>

      {activeTab==="overview" && (
        <>
          {/* KPI Cards */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginBottom:16}}>
            {[
              {label:"Total Store Profit",val:`£${thisStats.totalProfit.toFixed(2)}`,color:"#6366f1",change:profitChange},
              {label:"Agency Earnings",val:`£${thisStats.totalAgency.toFixed(2)}`,color:"#22c55e",change:agencyChange},
              {label:"Total to VAs",val:`£${thisStats.totalVA.toFixed(2)}`,color:"#f59e0b",change:pctChange(thisStats.totalVA,lastStats.totalVA)},
              {label:"Total Penalties",val:`£${thisStats.totalPen.toFixed(2)}`,color:"#ef4444",change:pctChange(thisStats.totalPen,lastStats.totalPen)},
            ].map(k=>(
              <div key={k.label} style={{...kpiCard(k.color)}}>
                <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:k.color}}></div>
                <div style={{fontSize:10.5,fontWeight:500,color:"rgba(255,255,255,0.35)",textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:8}}>{k.label}</div>
                <div style={{fontSize:20,fontWeight:600,letterSpacing:"-0.03em",marginBottom:6}}>{k.val}</div>
                <Arrow pct={k.change}/>
              </div>
            ))}
          </div>

          {/* Best of month */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:16}}>
            <div style={{...card,borderColor:"rgba(251,191,36,0.3)"}}>
              <div style={{fontSize:10,color:"#fbbf24",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>🏆 Best VA This Month</div>
              {bestVA ? <>
                <div style={{fontSize:15,fontWeight:600,color:"#fff"}}>{bestVA.vaName}</div>
                <div style={{fontSize:11,color:"rgba(255,255,255,0.4)",marginTop:2}}>{bestVA.storeName}</div>
                <div style={{fontSize:16,fontWeight:600,color:"#86efac",marginTop:6}}>£{bestVA.profit.toFixed(2)}</div>
              </> : <div style={{fontSize:12,color:"rgba(255,255,255,0.3)"}}>No data yet</div>}
            </div>
            <div style={{...card,borderColor:"rgba(99,102,241,0.3)"}}>
              <div style={{fontSize:10,color:"#a5b4fc",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>🏅 Best Department</div>
              {bestDept.dept ? <>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                  <div style={{width:8,height:8,borderRadius:"50%",background:DEPT_COLORS[bestDept.dept]}}></div>
                  <div style={{fontSize:15,fontWeight:600,color:"#fff"}}>{bestDept.dept}</div>
                </div>
                <div style={{fontSize:16,fontWeight:600,color:"#a5b4fc",marginTop:6}}>£{bestDept.profit.toFixed(2)}</div>
              </> : <div style={{fontSize:12,color:"rgba(255,255,255,0.3)"}}>No data yet</div>}
            </div>
            <div style={{...card,borderColor:"rgba(34,197,94,0.3)"}}>
              <div style={{fontSize:10,color:"#86efac",fontWeight:600,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>📊 Active Accounts</div>
              <div style={{fontSize:24,fontWeight:600,color:"#fff"}}>{thisStats.count}</div>
              <div style={{fontSize:11,color:"rgba(255,255,255,0.35)",marginTop:4}}>{activeDept==="All"?"All Departments":activeDept}</div>
              <div style={{fontSize:12,color:"rgba(255,255,255,0.4)",marginTop:4}}>Last month: £{lastStats.totalProfit.toFixed(0)}</div>
            </div>
          </div>

          {/* Dept breakdown or VA table */}
          {activeDept==="All" ? (
            <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:14}}>
              {DEPTS.filter(d=>d!=="All").map(d=>{
                const s=getStats(d,currentMonth);
                const ls=getStats(d,lastMonth);
                const ch=pctChange(s.totalProfit,ls.totalProfit);
                return (
                  <div key={d} onClick={()=>setActiveDept(d)} style={{...card,border:`0.5px solid ${DEPT_COLORS[d]}33`,cursor:"pointer"}}>
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
                      <div style={{width:8,height:8,borderRadius:"50%",background:DEPT_COLORS[d]}}></div>
                      <span style={{fontSize:13,fontWeight:600}}>{d}</span>
                      <span style={{marginLeft:"auto"}}><Arrow pct={ch}/></span>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8}}>
                      <div><div style={{fontSize:9,color:"rgba(255,255,255,0.3)",marginBottom:2}}>Profit</div><div style={{fontSize:14,fontWeight:600}}>£{s.totalProfit.toFixed(0)}</div></div>
                      <div><div style={{fontSize:9,color:"rgba(255,255,255,0.3)",marginBottom:2}}>Agency</div><div style={{fontSize:14,fontWeight:600,color:"#22c55e"}}>£{s.totalAgency.toFixed(0)}</div></div>
                      <div><div style={{fontSize:9,color:"rgba(255,255,255,0.3)",marginBottom:2}}>To VAs</div><div style={{fontSize:14,fontWeight:600,color:"#f59e0b"}}>£{s.totalVA.toFixed(0)}</div></div>
                      <div><div style={{fontSize:9,color:"rgba(255,255,255,0.3)",marginBottom:2}}>Penalties</div><div style={{fontSize:14,fontWeight:600,color:"#f87171"}}>£{s.totalPen.toFixed(0)}</div></div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{...card}}>
              <div style={{padding:"0 0 10px",marginBottom:10,borderBottom:"0.5px solid rgba(255,255,255,0.06)"}}><span style={{fontSize:12.5,fontWeight:500}}>VA Performance — {activeDept}</span></div>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:12.5}}>
                <thead><tr style={{borderBottom:"0.5px solid rgba(255,255,255,0.06)"}}>
                  {["VA Name","Store","VA%","Profit £","VA £","Payment"].map(h=>(
                    <th key={h} style={{textAlign:"left",padding:"9px 10px",fontSize:10.5,fontWeight:500,color:"rgba(255,255,255,0.28)",textTransform:"uppercase",letterSpacing:"0.07em"}}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {filteredAccounts.map(a=>{const c=calcRow(a);const e=getEntry(a.id);return(
                    <tr key={a.id} style={{borderBottom:"0.5px solid rgba(255,255,255,0.04)"}}>
                      <td style={{padding:"9px 10px",color:"#fff",fontWeight:500}}>{a.vaName}</td>
                      <td style={{padding:"9px 10px",color:"rgba(255,255,255,0.5)",fontSize:12}}>{a.storeName}</td>
                      <td style={{padding:"9px 10px",color:"rgba(255,255,255,0.5)"}}>{a.vaPct}%</td>
                      <td style={{padding:"9px 10px",fontWeight:500}}>£{c.profit.toFixed(2)}</td>
                      <td style={{padding:"9px 10px",color:"#86efac",fontWeight:500}}>£{c.vaGBP.toFixed(2)}</td>
                      <td style={{padding:"9px 10px"}}><span style={{fontSize:10,padding:"3px 8px",borderRadius:5,background:e.paymentStatus==="Paid"?"rgba(34,197,94,0.12)":e.paymentStatus==="Overdue"?"rgba(239,68,68,0.12)":"rgba(245,158,11,0.12)",color:e.paymentStatus==="Paid"?"#86efac":e.paymentStatus==="Overdue"?"#fca5a5":"#fcd34d"}}>{e.paymentStatus||"Pending"}</span></td>
                    </tr>
                  );})}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {activeTab==="va-list" && (
        <div>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search VA or Store..." style={{width:"100%",maxWidth:340,background:"rgba(255,255,255,0.06)",border:"0.5px solid rgba(255,255,255,0.1)",borderRadius:9,padding:"9px 14px",color:"#fff",fontSize:13,outline:"none",marginBottom:16,fontFamily:"inherit"}}/>
          <div style={card}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:12.5}}>
              <thead><tr style={{borderBottom:"0.5px solid rgba(255,255,255,0.06)"}}>
                {["#","VA Name","Store","Dept","C%","A%","V%"].map(h=>(
                  <th key={h} style={{textAlign:"left",padding:"9px 14px",fontSize:10.5,fontWeight:500,color:"rgba(255,255,255,0.28)",textTransform:"uppercase",letterSpacing:"0.07em"}}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {filteredAccounts.map((a,i)=>(
                  <tr key={a.id} style={{borderBottom:"0.5px solid rgba(255,255,255,0.04)"}}>
                    <td style={{padding:"10px 14px",color:"rgba(255,255,255,0.3)",fontSize:12}}>{i+1}</td>
                    <td style={{padding:"10px 14px",color:"#fff",fontWeight:500}}>{a.vaName}</td>
                    <td style={{padding:"10px 14px",color:"rgba(255,255,255,0.5)"}}>{a.storeName}</td>
                    <td style={{padding:"10px 14px"}}><span style={{fontSize:10,padding:"2px 8px",borderRadius:4,background:DEPT_COLORS[a.dept]+"22",color:DEPT_COLORS[a.dept]}}>{a.dept}</span></td>
                    <td style={{padding:"10px 14px",color:"rgba(255,255,255,0.5)"}}>{a.clientPct}%</td>
                    <td style={{padding:"10px 14px",color:"rgba(255,255,255,0.5)"}}>{a.agencyPct}%</td>
                    <td style={{padding:"10px 14px",color:"rgba(255,255,255,0.5)"}}>{a.vaPct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  // ── MONTHLY SHEET ──
  const MonthlySheet = (
    <div style={{flex:1,overflowY:"auto",padding:"16px 26px"}}>
      <div style={{display:"flex",gap:8,marginBottom:16,flexWrap:"wrap"}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search VA or Store..." style={{background:"rgba(255,255,255,0.06)",border:"0.5px solid rgba(255,255,255,0.1)",borderRadius:9,padding:"8px 14px",color:"#fff",fontSize:12.5,outline:"none",width:230,fontFamily:"inherit"}}/>
        {DEPTS.map(d=>(
          <button key={d} onClick={()=>setActiveDept(d)} style={{padding:"7px 14px",borderRadius:8,fontSize:12,cursor:"pointer",fontFamily:"inherit",border:activeDept===d?"none":"0.5px solid rgba(255,255,255,0.1)",background:activeDept===d?"#6366f1":"rgba(255,255,255,0.05)",color:activeDept===d?"#fff":"rgba(255,255,255,0.45)",fontWeight:activeDept===d?500:400}}>{d}</button>
        ))}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:6}}>
        {filteredAccounts.map((a,i)=>{
          const c=calcRow(a);
          const e=getEntry(a.id);
          const isOpen=expandedRow===a.id;
          return (
            <div key={a.id} style={{background:"#13151f",border:`0.5px solid ${isOpen?"#6366f1":"rgba(255,255,255,0.07)"}`,borderRadius:12,overflow:"hidden",transition:"border 0.15s"}}>
              <div onClick={()=>setExpandedRow(isOpen?null:a.id)} style={{display:"flex",alignItems:"center",padding:"12px 16px",cursor:"pointer",gap:12}}>
                <div style={{width:28,height:28,borderRadius:7,background:"rgba(99,102,241,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:600,color:"#a5b4fc",flexShrink:0}}>{i+1}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:500,color:"#fff"}}>{a.vaName}</div>
                  <div style={{fontSize:11,color:"rgba(255,255,255,0.4)",marginTop:2}}>{a.storeName}</div>
                </div>
                <span style={{fontSize:10,padding:"3px 9px",borderRadius:5,background:DEPT_COLORS[a.dept]+"22",color:DEPT_COLORS[a.dept],fontWeight:500,flexShrink:0}}>{a.dept}</span>
                <div style={{textAlign:"right",minWidth:90,flexShrink:0}}>
                  <div style={{fontSize:11,color:"rgba(255,255,255,0.4)"}}>Net Profit</div>
                  <div style={{fontSize:14,fontWeight:600,color:c.netProfit<0?"#f87171":"#86efac"}}>{role==="ceo"?`£${c.netProfit.toFixed(2)}`:"—"}</div>
                </div>
                <div style={{textAlign:"right",minWidth:80,flexShrink:0}}>
                  <div style={{fontSize:11,color:"rgba(255,255,255,0.4)"}}>VA GBP</div>
                  <div style={{fontSize:14,fontWeight:600,color:"#a5b4fc"}}>{role==="ceo"?`£${c.vaGBP.toFixed(2)}`:"—"}</div>
                </div>
                {e.paymentStatus&&<span style={{fontSize:10,padding:"3px 9px",borderRadius:5,background:e.paymentStatus==="Paid"?"rgba(34,197,94,0.15)":e.paymentStatus==="Overdue"?"rgba(239,68,68,0.15)":"rgba(245,158,11,0.15)",color:e.paymentStatus==="Paid"?"#86efac":e.paymentStatus==="Overdue"?"#f87171":"#fcd34d",flexShrink:0}}>{e.paymentStatus}</span>}
                <span style={{fontSize:16,color:"rgba(255,255,255,0.3)",display:"inline-block",transform:isOpen?"rotate(90deg)":"rotate(0deg)",transition:"transform 0.2s",flexShrink:0}}>›</span>
              </div>
              {isOpen&&<ExpandedRow key={`${a.id}_${currentMonth}`} a={a} entryData={getEntry(a.id)} onSave={saveEntryToDB} onCancel={()=>setExpandedRow(null)} isCeo={role==="ceo"}/>}
            </div>
          );
        })}
      </div>
      {role==="ceo"&&<div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginTop:20}}>
        {[{label:"Total Store Profit",val:`£${thisStats.totalProfit.toFixed(2)}`,color:"#6366f1"},{label:"Agency Earnings",val:`£${thisStats.totalAgency.toFixed(2)}`,color:"#22c55e"},{label:"Total to VAs",val:`£${thisStats.totalVA.toFixed(2)}`,color:"#f59e0b"},{label:"Total Penalties",val:`£${thisStats.totalPen.toFixed(2)}`,color:"#ef4444"}].map(k=>(
          <div key={k.label} style={{...card}}>
            <div style={{fontSize:10.5,color:"rgba(255,255,255,0.35)",marginBottom:5}}>{k.label}</div>
            <div style={{fontSize:18,fontWeight:600,color:k.color}}>{k.val}</div>
          </div>
        ))}
      </div>}
    </div>
  );

  // ── ANALYTICS & REPORTS ──
  const Analytics = (
    <div style={{flex:1,overflowY:"auto",padding:"16px 26px"}}>
      {/* Controls */}
      <div style={{display:"flex",gap:8,marginBottom:20,flexWrap:"wrap",alignItems:"center"}}>
        <select value={reportYear} onChange={e=>setReportYear(e.target.value)} style={{background:"#1a1d2e",border:"0.5px solid rgba(255,255,255,0.15)",color:"#fff",borderRadius:8,padding:"7px 12px",fontSize:12,fontFamily:"inherit",outline:"none"}}>
          {["2024","2025","2026","2027"].map(y=><option key={y} value={y}>{y}</option>)}
        </select>
        <select value={reportDept} onChange={e=>setReportDept(e.target.value)} style={{background:"#1a1d2e",border:"0.5px solid rgba(255,255,255,0.15)",color:"#fff",borderRadius:8,padding:"7px 12px",fontSize:12,fontFamily:"inherit",outline:"none"}}>
          {DEPTS.map(d=><option key={d} value={d}>{d}</option>)}
        </select>
        {[["monthly","Monthly"],["yearly","Yearly"],["va","Per VA"],["dept","Per Dept"]].map(([v,l])=>(
          <button key={v} onClick={()=>setReportView(v)} style={{padding:"7px 14px",borderRadius:8,fontSize:12,cursor:"pointer",fontFamily:"inherit",border:reportView===v?"none":"0.5px solid rgba(255,255,255,0.1)",background:reportView===v?"#6366f1":"rgba(255,255,255,0.05)",color:reportView===v?"#fff":"rgba(255,255,255,0.45)"}}>{l}</button>
        ))}
      </div>

      {/* Monthly view */}
      {reportView==="monthly" && (
        <div>
          <div style={{...card,marginBottom:16}}>
            <div style={{fontSize:12.5,fontWeight:500,marginBottom:16}}>{reportYear} — Monthly Profit Trend {reportDept!=="All"?`(${reportDept})`:""}</div>
            <MiniBar data={monthlyData.map(d=>({label:d.label,val:d.val}))} color="#6366f1" height={80}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:16}}>
            <div style={card}>
              <div style={{fontSize:10,color:"rgba(255,255,255,0.35)",marginBottom:4}}>Total Profit {reportYear}</div>
              <div style={{fontSize:18,fontWeight:600,color:"#6366f1"}}>£{monthlyData.reduce((s,d)=>s+d.val,0).toFixed(2)}</div>
            </div>
            <div style={card}>
              <div style={{fontSize:10,color:"rgba(255,255,255,0.35)",marginBottom:4}}>Total Agency {reportYear}</div>
              <div style={{fontSize:18,fontWeight:600,color:"#22c55e"}}>£{monthlyData.reduce((s,d)=>s+d.agency,0).toFixed(2)}</div>
            </div>
            <div style={card}>
              <div style={{fontSize:10,color:"rgba(255,255,255,0.35)",marginBottom:4}}>Total Penalties {reportYear}</div>
              <div style={{fontSize:18,fontWeight:600,color:"#ef4444"}}>£{monthlyData.reduce((s,d)=>s+d.pen,0).toFixed(2)}</div>
            </div>
          </div>
          <div style={card}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:12.5}}>
              <thead><tr style={{borderBottom:"0.5px solid rgba(255,255,255,0.06)"}}>
                {["Month","Total Profit","Agency","To VAs","Penalties","Net"].map(h=>(
                  <th key={h} style={{textAlign:"left",padding:"9px 12px",fontSize:10.5,fontWeight:500,color:"rgba(255,255,255,0.28)",textTransform:"uppercase",letterSpacing:"0.07em"}}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {monthlyData.map((d,i)=>{
                  const net=d.agency+d.va;
                  const isCurrent=d.month===currentMonth;
                  return(
                    <tr key={i} style={{borderBottom:"0.5px solid rgba(255,255,255,0.04)",background:isCurrent?"rgba(99,102,241,0.08)":"transparent"}}>
                      <td style={{padding:"9px 12px",color:isCurrent?"#a5b4fc":"#fff",fontWeight:isCurrent?600:400}}>{d.label}{isCurrent?" (Now)":""}</td>
                      <td style={{padding:"9px 12px",fontWeight:500}}>£{d.val.toFixed(2)}</td>
                      <td style={{padding:"9px 12px",color:"#22c55e"}}>£{d.agency.toFixed(2)}</td>
                      <td style={{padding:"9px 12px",color:"#f59e0b"}}>£{d.va.toFixed(2)}</td>
                      <td style={{padding:"9px 12px",color:"#f87171"}}>£{d.pen.toFixed(2)}</td>
                      <td style={{padding:"9px 12px",color:"#86efac",fontWeight:500}}>£{net.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Yearly view */}
      {reportView==="yearly" && (
        <div>
          <div style={{...card,marginBottom:16}}>
            <div style={{fontSize:12.5,fontWeight:500,marginBottom:16}}>Yearly Comparison {reportDept!=="All"?`(${reportDept})`:""}</div>
            <MiniBar data={yearlyData} color="#22c55e" height={80}/>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
            {yearlyData.map(y=>(
              <div key={y.label} style={card}>
                <div style={{fontSize:11,color:"rgba(255,255,255,0.35)",marginBottom:6}}>{y.label}</div>
                <div style={{fontSize:20,fontWeight:600,color:"#fff"}}>£{y.val.toFixed(0)}</div>
                {y.label===selYear&&<div style={{fontSize:10,color:"#a5b4fc",marginTop:4}}>Current Year</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Per VA view */}
      {reportView==="va" && (
        <div style={card}>
          <div style={{fontSize:12.5,fontWeight:500,marginBottom:16}}>VA Performance — {MONTHS[parseInt(selMonth)-1]} {selYear}</div>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:12.5}}>
            <thead><tr style={{borderBottom:"0.5px solid rgba(255,255,255,0.06)"}}>
              {["VA Name","Store","Dept","Profit £","Agency £","VA £","Penalties £","Payment"].map(h=>(
                <th key={h} style={{textAlign:"left",padding:"9px 12px",fontSize:10.5,fontWeight:500,color:"rgba(255,255,255,0.28)",textTransform:"uppercase",letterSpacing:"0.07em"}}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {[...accounts].filter(a=>reportDept==="All"||a.dept===reportDept).sort((a,b)=>calcRow(b).profit-calcRow(a).profit).map((a,i)=>{
                const c=calcRow(a); const e=getEntry(a.id);
                return(
                  <tr key={a.id} style={{borderBottom:"0.5px solid rgba(255,255,255,0.04)"}}>
                    <td style={{padding:"9px 12px",color:"#fff",fontWeight:500}}>{i===0?"🏆 ":""}{a.vaName}</td>
                    <td style={{padding:"9px 12px",color:"rgba(255,255,255,0.5)",fontSize:12}}>{a.storeName}</td>
                    <td style={{padding:"9px 12px"}}><span style={{fontSize:10,padding:"2px 7px",borderRadius:4,background:DEPT_COLORS[a.dept]+"22",color:DEPT_COLORS[a.dept]}}>{a.dept}</span></td>
                    <td style={{padding:"9px 12px",fontWeight:500}}>£{c.profit.toFixed(2)}</td>
                    <td style={{padding:"9px 12px",color:"#22c55e"}}>£{c.agGBP.toFixed(2)}</td>
                    <td style={{padding:"9px 12px",color:"#86efac"}}>£{c.vaGBP.toFixed(2)}</td>
                    <td style={{padding:"9px 12px",color:"#f87171"}}>£{c.totalPenGBP.toFixed(2)}</td>
                    <td style={{padding:"9px 12px"}}><span style={{fontSize:10,padding:"3px 8px",borderRadius:5,background:e.paymentStatus==="Paid"?"rgba(34,197,94,0.12)":"rgba(245,158,11,0.12)",color:e.paymentStatus==="Paid"?"#86efac":"#fcd34d"}}>{e.paymentStatus||"Pending"}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Per Dept view */}
      {reportView==="dept" && (
        <div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:14}}>
            {DEPTS.filter(d=>d!=="All").map(d=>{
              const months12 = Array.from({length:12},(_,i)=>{
                const m=`${selYear}-${String(i+1).padStart(2,"0")}`;
                return getStats(d,m);
              });
              const yearTotal = months12.reduce((s,m)=>s+m.totalProfit,0);
              const yearAgency = months12.reduce((s,m)=>s+m.totalAgency,0);
              const yearPen = months12.reduce((s,m)=>s+m.totalPen,0);
              const currS = getStats(d,currentMonth);
              const lastS = getStats(d,lastMonth);
              return (
                <div key={d} style={{...card,border:`0.5px solid ${DEPT_COLORS[d]}33`}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
                    <div style={{width:10,height:10,borderRadius:"50%",background:DEPT_COLORS[d]}}></div>
                    <span style={{fontSize:14,fontWeight:600}}>{d}</span>
                    <span style={{marginLeft:"auto",fontSize:11,color:"rgba(255,255,255,0.35)"}}>{getDeptAccounts(d).length} accounts</span>
                  </div>
                  <MiniBar data={months12.map((s,i)=>({label:SHORT_MONTHS[i],val:s.totalProfit}))} color={DEPT_COLORS[d]} height={50}/>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:8,marginTop:12}}>
                    <div style={{background:"rgba(255,255,255,0.03)",borderRadius:8,padding:10}}>
                      <div style={{fontSize:9,color:"rgba(255,255,255,0.3)",marginBottom:3}}>This Month</div>
                      <div style={{fontSize:15,fontWeight:600}}>£{currS.totalProfit.toFixed(0)}</div>
                      <Arrow pct={pctChange(currS.totalProfit,lastS.totalProfit)}/>
                    </div>
                    <div style={{background:"rgba(255,255,255,0.03)",borderRadius:8,padding:10}}>
                      <div style={{fontSize:9,color:"rgba(255,255,255,0.3)",marginBottom:3}}>Year {selYear}</div>
                      <div style={{fontSize:15,fontWeight:600,color:"#22c55e"}}>£{yearTotal.toFixed(0)}</div>
                    </div>
                    <div style={{background:"rgba(255,255,255,0.03)",borderRadius:8,padding:10}}>
                      <div style={{fontSize:9,color:"rgba(255,255,255,0.3)",marginBottom:3}}>Agency {selYear}</div>
                      <div style={{fontSize:15,fontWeight:600,color:"#c4b5fd"}}>£{yearAgency.toFixed(0)}</div>
                    </div>
                    <div style={{background:"rgba(255,255,255,0.03)",borderRadius:8,padding:10}}>
                      <div style={{fontSize:9,color:"rgba(255,255,255,0.3)",marginBottom:3}}>Penalties {selYear}</div>
                      <div style={{fontSize:15,fontWeight:600,color:"#f87171"}}>£{yearPen.toFixed(0)}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  // ── SETTINGS ──
  const SettingsPanel = (
    <div style={{flex:1,overflowY:"auto",padding:"16px 26px"}}>
      <div style={{display:"flex",gap:2,marginBottom:20,borderBottom:"0.5px solid rgba(255,255,255,0.06)"}}>
        {[["general","⚙️ General"],["va","👥 VA Management"],["trash","🗑️ VA Trash"],...(role==="ceo"?[["users","🔐 User Management"],["managers","🏷️ Managers"],["whatsapp","📱 WhatsApp"]]:[])] .map(([id,lbl])=>(
          <button key={id} onClick={()=>setSettingsTab(id)} style={{padding:"8px 18px",fontSize:12.5,cursor:"pointer",color:settingsTab===id?"#fff":"rgba(255,255,255,0.35)",borderBottom:settingsTab===id?"2px solid #6366f1":"2px solid transparent",background:"none",border:"none",borderBottom:settingsTab===id?"2px solid #6366f1":"2px solid transparent",fontFamily:"inherit",fontWeight:settingsTab===id?500:400,marginBottom:-0.5}}>{lbl}</button>
        ))}
      </div>

      {settingsTab==="general"&&(
        <div style={{maxWidth:400}}>
          <div style={{...card}}>
            <div style={{fontSize:13,fontWeight:500,marginBottom:16}}>GBP → PKR Rate</div>
            <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:10}}>
              <input type="number" value={rate} onChange={e=>setRate(Number(e.target.value))} style={{background:"rgba(255,255,255,0.06)",border:"0.5px solid rgba(255,255,255,0.12)",borderRadius:9,padding:"10px 14px",color:"#fff",fontSize:14,outline:"none",width:150,fontFamily:"inherit"}}/>
              <button onClick={async()=>{try{await fetch(`${API}/api/rate`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({rate})});alert("Rate saved!");}catch(e){}}} style={{background:"#6366f1",border:"none",borderRadius:9,padding:"10px 20px",color:"#fff",fontSize:13,fontWeight:500,cursor:"pointer",fontFamily:"inherit"}}>Save</button>
            </div>
            <div style={{fontSize:11,color:"rgba(255,255,255,0.3)"}}>£1 = Rs {rate}</div>
          </div>
        </div>
      )}

      {settingsTab==="va"&&(
        <div>
          <div style={{...card,marginBottom:20}}>
            <div style={{fontSize:13,fontWeight:500,marginBottom:14}}>Add New VA / Store</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:10}}>
              <input placeholder="VA Name *" value={newVA.vaName} onChange={e=>setNewVA({...newVA,vaName:e.target.value})} style={{background:"rgba(255,255,255,0.06)",border:"0.5px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"9px 12px",color:"#fff",fontSize:12.5,outline:"none",fontFamily:"inherit"}}/>
              <input placeholder="Store Name *" value={newVA.storeName} onChange={e=>setNewVA({...newVA,storeName:e.target.value})} style={{background:"rgba(255,255,255,0.06)",border:"0.5px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"9px 12px",color:"#fff",fontSize:12.5,outline:"none",fontFamily:"inherit"}}/>
              <select value={newVA.dept} onChange={e=>setNewVA({...newVA,dept:e.target.value})} style={{background:"#1a1d2e",border:"0.5px solid rgba(255,255,255,0.15)",borderRadius:8,padding:"9px 12px",color:"#fff",fontSize:12.5,outline:"none",fontFamily:"inherit",cursor:"pointer"}}>
                <option value="OnBuy">OnBuy</option>
                <option value="eBay">eBay</option>
                <option value="Amazon">Amazon</option>
                <option value="TikTok Shop">TikTok Shop</option>
              </select>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:10}}>
              {[["clientPct","Client %"],["agencyPct","Agency %"],["vaPct","VA %"]].map(([f,lbl])=>(
                <div key={f}>
                  <div style={{fontSize:10.5,color:"rgba(255,255,255,0.4)",marginBottom:4}}>{lbl}</div>
                  <input value={newVA[f]} onChange={e=>setNewVA({...newVA,[f]:e.target.value})} type="number" style={{width:"100%",background:"rgba(255,255,255,0.06)",border:"0.5px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"9px 10px",color:"#fff",fontSize:12,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
                </div>
              ))}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:14}}>
              {[["bankName","Bank Name (HBL, UBL...)"],["accountNo","Account No / IBAN"],["bank","Account Title"]].map(([f,lbl])=>(
                <div key={f}>
                  <div style={{fontSize:10.5,color:"rgba(255,255,255,0.4)",marginBottom:4}}>{lbl}</div>
                  <input placeholder={lbl} value={newVA[f]} onChange={e=>setNewVA({...newVA,[f]:e.target.value})} style={{width:"100%",background:"rgba(255,255,255,0.06)",border:"0.5px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"9px 10px",color:"#fff",fontSize:12,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
                </div>
              ))}
            </div>
            <button onClick={addAccount} style={{background:"#6366f1",border:"none",borderRadius:9,padding:"10px 24px",color:"#fff",fontSize:13,fontWeight:500,cursor:"pointer",fontFamily:"inherit"}}>+ Add VA / Store</button>
          </div>

          <div style={{...card,padding:0,overflow:"hidden"}}>
            <div style={{padding:"12px 16px",borderBottom:"0.5px solid rgba(255,255,255,0.06)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span style={{fontSize:12.5,fontWeight:500}}>All VAs ({accounts.length})</span>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search VA or Store..." style={{background:"rgba(255,255,255,0.06)",border:"0.5px solid rgba(255,255,255,0.08)",borderRadius:7,padding:"5px 12px",color:"#fff",fontSize:12,outline:"none",width:200,fontFamily:"inherit"}}/>
            </div>
            {accounts.filter(a=>!search||a.vaName.toLowerCase().includes(search.toLowerCase())||a.storeName.toLowerCase().includes(search.toLowerCase())).map((a,i)=>(
              <div key={a.id}>
                {editId===a.id?(
                  <div style={{padding:"12px 16px",borderBottom:"0.5px solid rgba(255,255,255,0.04)",background:"rgba(99,102,241,0.05)"}}>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:8}}>
                      {["vaName","storeName"].map(f=>(<input key={f} value={editVA[f]||""} onChange={e=>setEditVA({...editVA,[f]:e.target.value})} style={{background:"rgba(255,255,255,0.08)",border:"0.5px solid #6366f1",borderRadius:6,padding:"7px 10px",color:"#fff",fontSize:12.5,outline:"none",fontFamily:"inherit"}}/>))}
                      <select value={editVA.dept||""} onChange={e=>setEditVA({...editVA,dept:e.target.value})} style={{background:"#1a1d2e",border:"0.5px solid #6366f1",borderRadius:6,padding:"7px 10px",color:"#fff",fontSize:12.5,fontFamily:"inherit",outline:"none",cursor:"pointer"}}>
                        <option value="OnBuy">OnBuy</option>
                        <option value="eBay">eBay</option>
                        <option value="Amazon">Amazon</option>
                        <option value="TikTok Shop">TikTok Shop</option>
                      </select>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:8,marginBottom:10}}>
                      {[["clientPct","C%"],["agencyPct","A%"],["vaPct","V%"],["bankName","Bank"],["accountNo","Acc/IBAN"],["bank","Title"]].map(([f,lbl])=>(
                        <div key={f}>
                          <div style={{fontSize:9,color:"rgba(255,255,255,0.3)",marginBottom:3}}>{lbl}</div>
                          <input value={editVA[f]||""} onChange={e=>setEditVA({...editVA,[f]:e.target.value})} style={{width:"100%",background:"rgba(255,255,255,0.08)",border:"0.5px solid #6366f1",borderRadius:6,padding:"7px 8px",color:"#fff",fontSize:11.5,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
                        </div>
                      ))}
                    </div>
                    <div style={{display:"flex",gap:8}}>
                      <button onClick={()=>saveEdit(a.id)} style={{background:"rgba(34,197,94,0.15)",color:"#86efac",border:"none",borderRadius:7,padding:"7px 16px",fontSize:12,cursor:"pointer",fontFamily:"inherit",fontWeight:500}}>Save ✓</button>
                      <button onClick={()=>{setEditId(null);setEditVA({});}} style={{background:"rgba(255,255,255,0.06)",color:"rgba(255,255,255,0.5)",border:"none",borderRadius:7,padding:"7px 14px",fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Cancel</button>
                    </div>
                  </div>
                ):(
                  <div style={{display:"flex",alignItems:"center",padding:"11px 16px",borderBottom:"0.5px solid rgba(255,255,255,0.04)",gap:10}}>
                    <span style={{fontSize:11,color:"rgba(255,255,255,0.25)",width:22}}>{i+1}</span>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:500,color:"#fff"}}>{a.vaName}</div>
                      <div style={{fontSize:11,color:"rgba(255,255,255,0.4)",marginTop:1}}>{a.storeName}</div>
                      {(a.bankName||a.accountNo)&&<div style={{fontSize:10.5,color:"rgba(255,255,255,0.3)",marginTop:2}}>🏦 {a.bankName||""}{a.accountNo?" | "+a.accountNo:""}{a.bank?" | "+a.bank:""}</div>}
                    </div>
                    <span style={{fontSize:10,padding:"2px 8px",borderRadius:4,background:DEPT_COLORS[a.dept]+"22",color:DEPT_COLORS[a.dept]}}>{a.dept}</span>
                    <span style={{fontSize:11,color:"rgba(255,255,255,0.35)",minWidth:100}}>{a.clientPct}% / {a.agencyPct}% / {a.vaPct}%</span>
                    <button onClick={()=>{setEditId(a.id);setEditVA({...a});}} style={{background:"rgba(99,102,241,0.12)",color:"#a5b4fc",border:"none",borderRadius:6,padding:"5px 12px",fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>Edit</button>
                    <button onClick={()=>deleteAccount(a.id)} style={{background:"rgba(239,68,68,0.1)",color:"#f87171",border:"none",borderRadius:6,padding:"5px 12px",fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>Delete</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {settingsTab==="trash"&&(
        <div style={{...card,padding:0,overflow:"hidden"}}>
          <div style={{padding:"14px 16px",borderBottom:"0.5px solid rgba(255,255,255,0.06)",display:"flex",justifyContent:"space-between"}}>
            <span style={{fontSize:12.5,fontWeight:500}}>VA Trash</span>
            <span style={{fontSize:11,color:"rgba(255,255,255,0.3)"}}>{vaTrash.filter(a=>new Date(a.expiresAt)>new Date()).length} items — 30 days recovery</span>
          </div>
          {vaTrash.filter(a=>new Date(a.expiresAt)>new Date()).length===0?(
            <div style={{padding:48,textAlign:"center",color:"rgba(255,255,255,0.25)",fontSize:13}}>Trash is empty</div>
          ):vaTrash.filter(a=>new Date(a.expiresAt)>new Date()).map((a,i)=>{
            const daysLeft=Math.ceil((new Date(a.expiresAt)-new Date())/(1000*60*60*24));
            return(
              <div key={i} style={{display:"flex",alignItems:"center",padding:"11px 16px",borderBottom:"0.5px solid rgba(255,255,255,0.04)",gap:10}}>
                <span style={{fontSize:11,color:"rgba(255,255,255,0.25)",width:22}}>{i+1}</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:500,color:"#fff"}}>{a.vaName}</div>
                  <div style={{fontSize:11,color:"rgba(255,255,255,0.4)",marginTop:1}}>{a.storeName}</div>
                </div>
                <span style={{fontSize:10,padding:"2px 8px",borderRadius:4,background:DEPT_COLORS[a.dept]+"22",color:DEPT_COLORS[a.dept]}}>{a.dept}</span>
                <span style={{fontSize:12,fontWeight:500,color:daysLeft<=7?"#f87171":"#fcd34d"}}>{daysLeft}d left</span>
                <button onClick={()=>restoreVA(a)} style={{background:"rgba(34,197,94,0.12)",color:"#86efac",border:"none",borderRadius:6,padding:"5px 14px",fontSize:11,cursor:"pointer",fontFamily:"inherit",fontWeight:500}}>Restore</button>
              </div>
            );
          })}
        </div>
      )}

      {settingsTab==="users"&&(
        <div style={{maxWidth:600}}>
          <UserManagement role={role} API={API}/>
        </div>
      )}
      {settingsTab==="managers"&&role==="ceo"&&(
        <div style={{maxWidth:700}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
            <div style={{fontSize:13,fontWeight:500}}>🏷️ Manager Accounts</div>
            <button onClick={()=>{setShowAddMgr(!showAddMgr);setEditMgrId(null);}} style={{background:"#6366f1",border:"none",borderRadius:8,padding:"7px 16px",color:"#fff",fontSize:12,cursor:"pointer",fontFamily:"inherit",fontWeight:500}}>+ Add Manager</button>
          </div>
          <div style={{fontSize:11.5,color:"rgba(255,255,255,0.3)",marginBottom:14,background:"rgba(99,102,241,0.06)",border:"0.5px solid rgba(99,102,241,0.15)",borderRadius:8,padding:"10px 14px"}}>
            Managers log in with their <strong style={{color:"#a5b4fc"}}>username</strong> + <strong style={{color:"#a5b4fc"}}>PIN</strong> on the main login screen. They see only their department's tasks.
          </div>
          {showAddMgr&&(
            <div style={{background:"#13151f",border:"0.5px solid rgba(99,102,241,0.3)",borderRadius:12,padding:20,marginBottom:16}}>
              <div style={{fontSize:12,fontWeight:500,color:"#a5b4fc",marginBottom:14}}>New Manager</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
                <div><div style={{fontSize:10.5,color:"rgba(255,255,255,0.4)",marginBottom:4}}>Full Name</div><input value={newMgr.name} onChange={e=>setNewMgr(p=>({...p,name:e.target.value}))} placeholder="e.g. OnBuy Manager" style={{width:"100%",background:"rgba(255,255,255,0.07)",border:"0.5px solid rgba(255,255,255,0.15)",borderRadius:8,padding:"9px 12px",color:"#fff",fontSize:13,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/></div>
                <div><div style={{fontSize:10.5,color:"rgba(255,255,255,0.4)",marginBottom:4}}>Username (for login)</div><input value={newMgr.username} onChange={e=>setNewMgr(p=>({...p,username:e.target.value}))} placeholder="e.g. onbuy" style={{width:"100%",background:"rgba(255,255,255,0.07)",border:"0.5px solid rgba(255,255,255,0.15)",borderRadius:8,padding:"9px 12px",color:"#fff",fontSize:13,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/></div>
                <div><div style={{fontSize:10.5,color:"rgba(255,255,255,0.4)",marginBottom:4}}>Department</div><select value={newMgr.department} onChange={e=>setNewMgr(p=>({...p,department:e.target.value}))} style={{width:"100%",background:"#1a1d2e",border:"0.5px solid rgba(255,255,255,0.15)",borderRadius:8,padding:"9px 12px",color:"#fff",fontSize:13,fontFamily:"inherit",outline:"none"}}>{["OnBuy","eBay","Amazon","TikTok Shop"].map(d=><option key={d} value={d}>{d}</option>)}</select></div>
                <div><div style={{fontSize:10.5,color:"rgba(255,255,255,0.4)",marginBottom:4}}>PIN</div><input value={newMgr.pin} onChange={e=>setNewMgr(p=>({...p,pin:e.target.value}))} placeholder="e.g. 1234" style={{width:"100%",background:"rgba(255,255,255,0.07)",border:"0.5px solid rgba(255,255,255,0.15)",borderRadius:8,padding:"9px 12px",color:"#fff",fontSize:13,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/></div>
                <div style={{gridColumn:"1/-1"}}><div style={{fontSize:10.5,color:"rgba(255,255,255,0.4)",marginBottom:4}}>WhatsApp Number <span style={{color:"rgba(255,255,255,0.25)"}}>(for task notifications, e.g. 923001234567)</span></div><input value={newMgr.whatsapp} onChange={e=>setNewMgr(p=>({...p,whatsapp:e.target.value}))} placeholder="e.g. 923001234567 (no + or spaces)" style={{width:"100%",background:"rgba(255,255,255,0.07)",border:"0.5px solid rgba(255,255,255,0.15)",borderRadius:8,padding:"9px 12px",color:"#fff",fontSize:13,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/></div>
              </div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={async()=>{if(!newMgr.name.trim()||!newMgr.username.trim()||!newMgr.pin.trim())return alert("Name, username and PIN required!");try{const r=await fetch(`${API}/api/managers`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(newMgr)});const d=await r.json();if(d.id){setManagers(p=>[...p,d]);setNewMgr({name:"",username:"",department:"OnBuy",pin:""});setShowAddMgr(false);}}catch(e){alert("Error: "+e.message);}}} style={{background:"#6366f1",border:"none",borderRadius:8,padding:"9px 20px",color:"#fff",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Add Manager</button>
                <button onClick={()=>setShowAddMgr(false)} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:8,padding:"9px 16px",color:"rgba(255,255,255,0.5)",fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Cancel</button>
              </div>
            </div>
          )}
          <div style={{background:"#13151f",border:"0.5px solid rgba(255,255,255,0.07)",borderRadius:12,overflow:"hidden"}}>
            <div style={{padding:"12px 16px",borderBottom:"0.5px solid rgba(255,255,255,0.06)"}}><span style={{fontSize:12.5,fontWeight:500}}>All Managers ({managers.length})</span></div>
            {managers.length===0&&<div style={{padding:"24px",textAlign:"center",color:"rgba(255,255,255,0.25)",fontSize:12}}>No managers yet — they'll appear after first deploy.</div>}
            {managers.map(m=>(
              <div key={m.id}>
                {editMgrId===m.id?(
                  <div style={{padding:"14px 16px",borderBottom:"0.5px solid rgba(255,255,255,0.04)",background:"rgba(99,102,241,0.05)"}}>
                    <div style={{fontSize:11,color:"#a5b4fc",marginBottom:10,fontWeight:500}}>Editing: {m.name}</div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
                      <div><div style={{fontSize:10.5,color:"rgba(255,255,255,0.4)",marginBottom:4}}>Full Name</div><input value={editMgr.name||""} onChange={e=>setEditMgr(p=>({...p,name:e.target.value}))} style={{width:"100%",background:"rgba(255,255,255,0.07)",border:"0.5px solid rgba(255,255,255,0.15)",borderRadius:8,padding:"9px 12px",color:"#fff",fontSize:13,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/></div>
                      <div><div style={{fontSize:10.5,color:"rgba(255,255,255,0.4)",marginBottom:4}}>Username</div><input value={editMgr.username||""} onChange={e=>setEditMgr(p=>({...p,username:e.target.value}))} style={{width:"100%",background:"rgba(255,255,255,0.07)",border:"0.5px solid rgba(255,255,255,0.15)",borderRadius:8,padding:"9px 12px",color:"#fff",fontSize:13,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/></div>
                      <div><div style={{fontSize:10.5,color:"rgba(255,255,255,0.4)",marginBottom:4}}>Department</div><select value={editMgr.department||"OnBuy"} onChange={e=>setEditMgr(p=>({...p,department:e.target.value}))} style={{width:"100%",background:"#1a1d2e",border:"0.5px solid rgba(255,255,255,0.15)",borderRadius:8,padding:"9px 12px",color:"#fff",fontSize:13,fontFamily:"inherit",outline:"none"}}>{["OnBuy","eBay","Amazon","TikTok Shop"].map(d=><option key={d} value={d}>{d}</option>)}</select></div>
                      <div><div style={{fontSize:10.5,color:"rgba(255,255,255,0.4)",marginBottom:4}}>PIN (visible for editing)</div><input value={editMgr.pin||""} onChange={e=>setEditMgr(p=>({...p,pin:e.target.value}))} style={{width:"100%",background:"rgba(255,255,255,0.07)",border:"0.5px solid rgba(255,255,255,0.15)",borderRadius:8,padding:"9px 12px",color:"#fff",fontSize:13,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/></div>
                      <div style={{gridColumn:"1/-1"}}><div style={{fontSize:10.5,color:"rgba(255,255,255,0.4)",marginBottom:4}}>WhatsApp Number</div><input value={editMgr.whatsapp||""} onChange={e=>setEditMgr(p=>({...p,whatsapp:e.target.value}))} placeholder="e.g. 923001234567" style={{width:"100%",background:"rgba(255,255,255,0.07)",border:"0.5px solid rgba(255,255,255,0.15)",borderRadius:8,padding:"9px 12px",color:"#fff",fontSize:13,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/></div>
                    </div>
                    <div style={{display:"flex",gap:8}}>
                      <button onClick={async()=>{try{await fetch(`${API}/api/managers/${m.id}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(editMgr)});setManagers(p=>p.map(x=>x.id===m.id?{...x,...editMgr}:x));setEditMgrId(null);}catch(e){}}} style={{background:"rgba(34,197,94,0.15)",color:"#86efac",border:"none",borderRadius:7,padding:"7px 16px",fontSize:12,cursor:"pointer",fontFamily:"inherit",fontWeight:500}}>Save ✓</button>
                      <button onClick={()=>setEditMgrId(null)} style={{background:"rgba(255,255,255,0.06)",color:"rgba(255,255,255,0.5)",border:"none",borderRadius:7,padding:"7px 14px",fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Cancel</button>
                    </div>
                  </div>
                ):(
                  <div style={{display:"flex",alignItems:"center",padding:"12px 16px",borderBottom:"0.5px solid rgba(255,255,255,0.04)",gap:10}}>
                    <div style={{width:36,height:36,borderRadius:9,background:`${DEPT_COLORS[m.department]||"#6366f1"}20`,border:`1px solid ${DEPT_COLORS[m.department]||"#6366f1"}40`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:DEPT_COLORS[m.department]||"#6366f1",flexShrink:0}}>{(m.name||"M")[0].toUpperCase()}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,fontWeight:500,color:"#fff"}}>{m.name}</div>
                      <div style={{fontSize:11,color:"rgba(255,255,255,0.4)",marginTop:1}}>@{m.username} · PIN: ••••{m.whatsapp?<span style={{color:"#22c55e",marginLeft:6}}>📱 {m.whatsapp}</span>:<span style={{color:"rgba(255,255,255,0.2)",marginLeft:6}}>No WhatsApp</span>}</div>
                    </div>
                    <span style={{fontSize:10,padding:"3px 9px",borderRadius:5,background:`${DEPT_COLORS[m.department]||"#6366f1"}20`,color:DEPT_COLORS[m.department]||"#6366f1",fontWeight:600}}>{m.department}</span>
                    <button onClick={async()=>{try{const full=managers.find(x=>x.id===m.id);setEditMgr({name:full.name,username:full.username,department:full.department,pin:"",whatsapp:full.whatsapp||""});setEditMgrId(m.id);}catch(e){}}} style={{background:"rgba(99,102,241,0.12)",color:"#a5b4fc",border:"none",borderRadius:6,padding:"5px 12px",fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>Edit</button>
                    <button onClick={async()=>{if(!confirm("Delete this manager?"))return;try{await fetch(`${API}/api/managers/${m.id}`,{method:"DELETE"});setManagers(p=>p.filter(x=>x.id!==m.id));}catch(e){}}} style={{background:"rgba(239,68,68,0.1)",color:"#f87171",border:"none",borderRadius:6,padding:"5px 12px",fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>Delete</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      {settingsTab==="whatsapp"&&role==="ceo"&&(
        <div style={{maxWidth:520}}>
          <div style={{...card,marginBottom:16}}>
            <div style={{fontSize:13,fontWeight:500,marginBottom:4}}>WhatsApp Task Notifications</div>
            <div style={{fontSize:11.5,color:"rgba(255,255,255,0.35)",marginBottom:18,lineHeight:"1.6"}}>Sends a WhatsApp message to the assigned manager whenever a task is created. Uses the UltraMsg API — register free at <strong style={{color:"#a5b4fc"}}>ultramsg.com</strong> to get your credentials.</div>
            <div style={{marginBottom:12}}>
              <div style={{fontSize:10.5,color:"rgba(255,255,255,0.4)",marginBottom:5}}>Notifications</div>
              <select value={whatsappConfig.enabled?"yes":"no"} onChange={e=>setWhatsappConfig(p=>({...p,enabled:e.target.value==="yes"}))} style={{background:"#1a1d2e",border:"0.5px solid rgba(255,255,255,0.15)",borderRadius:8,padding:"9px 12px",color:"#fff",fontSize:13,fontFamily:"inherit",outline:"none",minWidth:160}}>
                <option value="no">Disabled</option>
                <option value="yes">Enabled</option>
              </select>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
              <div>
                <div style={{fontSize:10.5,color:"rgba(255,255,255,0.4)",marginBottom:5}}>Instance ID</div>
                <input value={whatsappConfig.instance_id||""} onChange={e=>setWhatsappConfig(p=>({...p,instance_id:e.target.value}))} placeholder="e.g. instance12345" style={{width:"100%",background:"rgba(255,255,255,0.06)",border:"0.5px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"9px 12px",color:"#fff",fontSize:12.5,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
              </div>
              <div>
                <div style={{fontSize:10.5,color:"rgba(255,255,255,0.4)",marginBottom:5}}>API Token</div>
                <input value={whatsappConfig.token||""} onChange={e=>setWhatsappConfig(p=>({...p,token:e.target.value}))} placeholder="Your UltraMsg token" style={{width:"100%",background:"rgba(255,255,255,0.06)",border:"0.5px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"9px 12px",color:"#fff",fontSize:12.5,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
              </div>
            </div>
            <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}>
              <button onClick={async()=>{try{await fetch(`${API}/api/whatsapp-config`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(whatsappConfig)});alert("WhatsApp config saved!");}catch(e){alert("Save failed");}}} style={{background:"#6366f1",border:"none",borderRadius:9,padding:"10px 24px",color:"#fff",fontSize:13,fontWeight:500,cursor:"pointer",fontFamily:"inherit"}}>Save Config</button>
              <input id="wa-test-num" placeholder="Test number e.g. 923001234567" style={{flex:1,minWidth:200,background:"rgba(255,255,255,0.06)",border:"0.5px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"9px 12px",color:"#fff",fontSize:12.5,outline:"none",fontFamily:"inherit"}}/>
              <button onClick={async()=>{const num=document.getElementById('wa-test-num').value.trim();if(!num){alert("Enter a phone number first");return;}try{const r=await fetch(`${API}/api/test-whatsapp`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({to_number:num})});const d=await r.json();if(d.success){alert("Test message sent! Check WhatsApp on "+num+"\n\nUltraMsg response: "+JSON.stringify(d.ultramsg_response||d.raw||''));}else{alert("Failed: "+JSON.stringify(d));}}catch(e){alert("Error: "+e.message);}}} style={{background:"rgba(34,197,94,0.15)",border:"0.5px solid rgba(34,197,94,0.3)",borderRadius:9,padding:"10px 18px",color:"#4ade80",fontSize:13,fontWeight:500,cursor:"pointer",fontFamily:"inherit"}}>Send Test</button>
            </div>
          </div>
          <div style={{background:"rgba(245,158,11,0.05)",border:"0.5px solid rgba(245,158,11,0.15)",borderRadius:12,padding:16}}>
            <div style={{fontSize:12,fontWeight:500,color:"#fcd34d",marginBottom:8}}>Setup Steps</div>
            <ol style={{fontSize:11.5,color:"rgba(255,255,255,0.45)",margin:0,paddingLeft:20,lineHeight:"2"}}>
              <li>Create a free account at <strong style={{color:"#a5b4fc"}}>ultramsg.com</strong></li>
              <li>Connect your WhatsApp by scanning the QR code</li>
              <li>Copy your Instance ID and Token from the dashboard</li>
              <li>Add each manager's WhatsApp number in <strong style={{color:"#a5b4fc"}}>Settings → Managers</strong></li>
              <li>Enable notifications above and Save</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );  // ── EMPLOYEE FUNCTIONS ──
  async function generateSalaryPayment(emp) {
    const month = selMonth;
    const year = selYear;
    const dueDate = `${year}-${month}-05`;
    try {
      const r = await fetch(`${API}/api/salary-payments`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
        employeeId:emp.id, month, year,
        amountPkr:emp.base_salary_pkr||0,
        amountGbp:emp.base_salary_gbp||0,
        status:"Pending", dueDate, notes:""
      })});
      const d = await r.json();
      setSalaryPayments(prev=>{
        const exists = prev.find(p=>p.employee_id===emp.id&&p.month===month&&p.year===year);
        if(exists) return prev.map(p=>p.id===d.id?d:p);
        return [...prev,d];
      });
      alert(`✅ Salary generated for ${emp.name}!`);
    } catch(e) { alert("Error: "+e.message); }
  }

  async function updateSalaryStatus(id, status, paidDate) {
    try {
      await fetch(`${API}/api/salary-payments/${id}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({status,paidDate:paidDate||null,notes:""})});
      setSalaryPayments(prev=>prev.map(p=>p.id===id?{...p,status,paid_date:paidDate}:p));
    } catch(e) {}
  }

  async function sendSalaryInvoice(emp, payment) {
    if (!emp.email) return alert("Employee email not set!");
    try {
      const r = await fetch(`${API}/api/send-salary-invoice`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
        employeeEmail:emp.email, employeeName:emp.name,
        month:payment.month, year:payment.year,
        amountPkr:payment.amount_pkr, amountGbp:payment.amount_gbp,
        bankDetails:emp.bank_name?`${emp.bank_name} | ${emp.account_no||""} | ${emp.account_title||""}`:"",
      })});
      const d = await r.json();
      if(d.success) alert(`✅ Salary slip sent to ${emp.email}`);
      else alert(`❌ ${d.error}`);
    } catch(e) { alert("Error"); }
  }

  async function addEmployee() {
    if (!newEmp.name.trim()) return alert("Name required!");
    if (!newEmp.joiningDate) return alert("Joining date required!");
    if (!newEmp.designation.trim()) return alert("Designation required!");
    if (!newEmp.phone.trim()) return alert("Phone required!");
    try {
      const r = await fetch(`${API}/api/employees`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(newEmp)});
      const d = await r.json();
      setEmployees(prev=>[...prev,d]);
      setNewEmp({name:"",cnic:"",dob:"",gender:"Male",joiningDate:new Date().toISOString().split("T")[0],designation:"",department:"",employmentType:"Full-time",status:"Active",email:"",phone:"",whatsapp:"",emergencyContact:"",emergencyPhone:"",address:"",city:"",bankName:"",accountNo:"",accountTitle:"",baseSalaryPkr:0,baseSalaryGbp:0,salaryType:"Monthly",notes:""});
      setEmpTab("list");
      alert(`✅ ${d.name} added!`);
    } catch(e) { alert("Error: "+e.message); }
  }

  async function saveEmpEdit(id) {
    if (!editEmp.name||!editEmp.name.trim()) return alert("Name required!");
    try {
      await fetch(`${API}/api/employees/${id}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(editEmp)});
      setEmployees(prev=>prev.map(e=>e.id===id?{...e,...editEmp}:e));
      setEditEmpId(null); setEditEmp({});
      alert("Saved ✓");
    } catch(e) { alert("Error"); }
  }

  async function deleteEmployee(id) {
    const emp = employees.find(e=>e.id===id);
    if (!confirm(`Move ${emp?.name} to trash?`)) return;
    try {
      await fetch(`${API}/api/employees/${id}`,{method:"DELETE"});
      setEmployees(prev=>prev.filter(e=>e.id!==id));
      setEmpTrash(prev=>[...prev,{...emp, deletedAt:new Date().toISOString(), expiresAt:new Date(Date.now()+30*24*60*60*1000).toISOString()}]);
      setSelectedEmpId(null);
      alert(`${emp?.name} moved to trash ✓`);
    } catch(e) {}
  }

  async function restoreEmployee(item) {
    try {
      const r = await fetch(`${API}/api/employees`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
        name:item.name, cnic:item.cnic||"", dob:item.dob||null, gender:item.gender||"Male",
        joiningDate:item.joining_date||null, designation:item.designation||"", department:item.department||"",
        employmentType:item.employment_type||"Full-time", status:item.status||"Active",
        email:item.email||"", phone:item.phone||"", whatsapp:item.whatsapp||"",
        emergencyContact:item.emergency_contact||"", emergencyPhone:item.emergency_phone||"",
        address:item.address||"", city:item.city||"",
        bankName:item.bank_name||"", accountNo:item.account_no||"", accountTitle:item.account_title||"",
        baseSalaryPkr:item.base_salary_pkr||0, baseSalaryGbp:item.base_salary_gbp||0,
        salaryType:item.salary_type||"Monthly", notes:item.notes||""
      })});
      const d = await r.json();
      setEmployees(prev=>[...prev,d]);
      setEmpTrash(prev=>prev.filter(e=>e.id!==item.id));
      alert(`${item.name} restored ✓`);
    } catch(e) { alert("Error restoring"); }
  }

  async function fetchSalaryHistory(empId) {
    try {
      const r = await fetch(`${API}/api/salary-history/${empId}`);
      const d = await r.json();
      setSalaryHistory(prev=>({...prev,[empId]:d}));
    } catch(e) {}
  }

  async function addSalaryIncrement(empId) {
    if (!newSalary.effectiveDate) return alert("Effective date required!");
    if (!newSalary.salaryPkr&&!newSalary.salaryGbp) return alert("Enter salary amount!");
    try {
      await fetch(`${API}/api/salary-history`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({employeeId:empId,...newSalary})});
      await fetchSalaryHistory(empId);
      setEmployees(prev=>prev.map(e=>e.id===empId?{...e,base_salary_pkr:newSalary.salaryPkr,base_salary_gbp:newSalary.salaryGbp}:e));
      setNewSalary({effectiveDate:"",salaryPkr:"",salaryGbp:"",reason:""});
      alert("Salary updated ✓");
    } catch(e) { alert("Error"); }
  }

  const empStatusColor=(s)=>s==="Active"?"#86efac":s==="Probation"?"#fcd34d":s==="Suspended"?"#f87171":"#94a3b8";

  function downloadVAListPDF() {
    const monthLabel = (() => {
      const [yr, mo] = currentMonth.split("-");
      return `${MONTHS[parseInt(mo,10)-1]} ${yr}`;
    })();

    const filtered = accounts.filter(a=>!vaSearch||a.vaName.toLowerCase().includes(vaSearch.toLowerCase())||a.storeName.toLowerCase().includes(vaSearch.toLowerCase()));
    const grouped = {};
    filtered.forEach(a=>{ if(!grouped[a.vaName]) grouped[a.vaName]=[]; grouped[a.vaName].push(a); });

    let grandProfit=0, grandVA=0, grandPen=0;

    const vaRows = Object.entries(grouped).map(([vaName, stores])=>{
      const totalProfit = stores.reduce((s,a)=>s+(parseFloat(getEntry(a.id).totalProfit)||0),0);
      const totalPen = stores.reduce((s,a)=>{const e=getEntry(a.id);return s+(parseFloat(e.hmrcFee)||0)+(parseFloat(e.counterfeit)||0)+(parseFloat(e.leavesPenalty)||0)+(parseFloat(e.feedbackDed)||0)+(parseFloat(e.lateArrival)||0)+(parseFloat(e.warningPenalty)||0)+(parseFloat(e.otherPenalty)||0);},0);
      const totalVA = stores.reduce((s,a)=>{const e=getEntry(a.id);const p=parseFloat(e.totalProfit)||0;const pen=(parseFloat(e.hmrcFee)||0)+(parseFloat(e.counterfeit)||0)+(parseFloat(e.leavesPenalty)||0)+(parseFloat(e.feedbackDed)||0)+(parseFloat(e.lateArrival)||0)+(parseFloat(e.warningPenalty)||0)+(parseFloat(e.otherPenalty)||0);return s+(p*(a.vaPct/100)-pen);},0);
      grandProfit+=totalProfit; grandVA+=totalVA; grandPen+=totalPen;

      const storeRows = stores.map(a=>{
        const e=getEntry(a.id);
        const profit=parseFloat(e.totalProfit)||0;
        const pen=(parseFloat(e.hmrcFee)||0)+(parseFloat(e.counterfeit)||0)+(parseFloat(e.leavesPenalty)||0)+(parseFloat(e.feedbackDed)||0)+(parseFloat(e.lateArrival)||0)+(parseFloat(e.warningPenalty)||0)+(parseFloat(e.otherPenalty)||0);
        const vaEarn=(profit*(a.vaPct/100))-pen;
        const bank=a.bankName?`${a.bankName} | ${a.accountNo}`:"—";
        const deptColor={OnBuy:"#f97316",eBay:"#f59e0b",Amazon:"#ef4444","TikTok Shop":"#8b5cf6"}[a.dept]||"#6366f1";
        return `<tr>
          <td>${a.storeName}</td>
          <td><span style="background:${deptColor}22;color:${deptColor};padding:1px 6px;border-radius:4px;font-size:10px">${a.dept}</span></td>
          <td style="color:#94a3b8">${a.clientPct}%</td>
          <td style="color:#94a3b8">${a.agencyPct}%</td>
          <td style="color:#94a3b8">${a.vaPct}%</td>
          <td style="color:#e2e8f0;font-weight:500">£${profit.toFixed(2)}</td>
          <td style="color:#86efac;font-weight:600">£${vaEarn.toFixed(2)}</td>
          <td style="color:#f87171">£${pen.toFixed(2)}</td>
          <td style="color:#94a3b8;font-size:10px">${bank}</td>
        </tr>`;
      }).join("");

      return `
        <div class="va-block">
          <div class="va-header">
            <div class="va-avatar">${vaName[0].toUpperCase()}</div>
            <div class="va-info">
              <div class="va-name">${vaName}</div>
              <div class="va-meta">${stores.length} store${stores.length>1?"s":""}</div>
            </div>
            <div class="va-summary">
              <span class="summary-label">Net Earning</span>
              <span class="va-earn">£${totalVA.toFixed(2)}</span>
            </div>
          </div>
          <table>
            <thead><tr>
              <th>Store</th><th>Dept</th><th>Client%</th><th>Agency%</th><th>VA%</th>
              <th>Profit</th><th>VA Earning</th><th>Penalties</th><th>Bank</th>
            </tr></thead>
            <tbody>${storeRows}</tbody>
          </table>
          <div class="va-totals">
            <div class="total-box blue">
              <div class="total-label">Store Profit</div>
              <div class="total-val">£${totalProfit.toFixed(2)}</div>
            </div>
            <div class="total-box green">
              <div class="total-label">VA Net Earning</div>
              <div class="total-val">£${totalVA.toFixed(2)}</div>
            </div>
            <div class="total-box red">
              <div class="total-label">Penalties</div>
              <div class="total-val">£${totalPen.toFixed(2)}</div>
            </div>
          </div>
        </div>`;
    }).join("");

    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
<title>VA List — ${monthLabel}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Segoe UI',Arial,sans-serif;background:#0a0b11;color:#e2e8f0;padding:24px;font-size:12px}
  .page-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;padding-bottom:14px;border-bottom:1px solid rgba(255,255,255,0.1)}
  .page-title{font-size:20px;font-weight:700;color:#fff}
  .page-meta{font-size:12px;color:#94a3b8}
  .grand-totals{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:24px}
  .grand-box{border-radius:10px;padding:14px;text-align:center}
  .grand-box.blue{background:rgba(99,102,241,0.15);border:1px solid rgba(99,102,241,0.3)}
  .grand-box.green{background:rgba(34,197,94,0.12);border:1px solid rgba(34,197,94,0.25)}
  .grand-box.red{background:rgba(239,68,68,0.12);border:1px solid rgba(239,68,68,0.25)}
  .grand-label{font-size:10px;color:#94a3b8;text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px}
  .grand-val{font-size:18px;font-weight:700}
  .grand-box.blue .grand-val{color:#a5b4fc}
  .grand-box.green .grand-val{color:#86efac}
  .grand-box.red .grand-val{color:#f87171}
  .va-block{background:#13151f;border:1px solid rgba(255,255,255,0.08);border-radius:12px;overflow:hidden;margin-bottom:14px;page-break-inside:avoid}
  .va-header{display:flex;align-items:center;padding:12px 14px;gap:10;background:rgba(255,255,255,0.02)}
  .va-avatar{width:36px;height:36px;border-radius:9px;background:linear-gradient(135deg,#f59e0b,#f97316);display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700;color:#fff;flex-shrink:0;margin-right:10px}
  .va-info{flex:1}
  .va-name{font-size:13px;font-weight:600;color:#fff}
  .va-meta{font-size:10px;color:#64748b;margin-top:2px}
  .va-summary{text-align:right}
  .summary-label{display:block;font-size:9px;color:#64748b;text-transform:uppercase;letter-spacing:.06em}
  .va-earn{font-size:14px;font-weight:700;color:#86efac}
  table{width:100%;border-collapse:collapse;font-size:11px}
  th{text-align:left;padding:7px 10px;font-size:9px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:.06em;border-bottom:1px solid rgba(255,255,255,0.06)}
  td{padding:8px 10px;border-bottom:1px solid rgba(255,255,255,0.03);color:#e2e8f0}
  .va-totals{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;padding:10px 14px;background:rgba(0,0,0,0.2)}
  .total-box{border-radius:7px;padding:8px 10px}
  .total-box.blue{background:rgba(99,102,241,0.1);border:0.5px solid rgba(99,102,241,0.2)}
  .total-box.green{background:rgba(34,197,94,0.08);border:0.5px solid rgba(34,197,94,0.2)}
  .total-box.red{background:rgba(239,68,68,0.08);border:0.5px solid rgba(239,68,68,0.2)}
  .total-label{font-size:9px;color:#64748b;text-transform:uppercase;letter-spacing:.06em;margin-bottom:3px}
  .total-val{font-size:13px;font-weight:600;color:#fff}
  .total-box.green .total-val{color:#86efac}
  .total-box.red .total-val{color:#f87171}
  .footer{margin-top:20px;text-align:center;font-size:10px;color:#334155;border-top:1px solid rgba(255,255,255,0.06);padding-top:12px}
  @media print{
    body{background:#fff;color:#1e293b;padding:16px}
    .page-header,.grand-box,.va-block,.total-box,.grand-box{border-color:rgba(0,0,0,0.12)!important;background:rgba(0,0,0,0.03)!important}
    .va-name,.grand-val,.total-val,.va-earn{color:#1e293b!important}
    th,td{color:#374151!important}
    .summary-label,.va-meta,.grand-label,.total-label{color:#6b7280!important}
    .page-title{color:#111827!important}
    .footer{color:#9ca3af!important;border-color:rgba(0,0,0,0.1)!important}
  }
</style></head><body>
<div class="page-header">
  <div>
    <div class="page-title">VA List Report</div>
    <div class="page-meta">${monthLabel} &nbsp;·&nbsp; ${Object.keys(grouped).length} VAs &nbsp;·&nbsp; ${filtered.length} Stores</div>
  </div>
  <div style="text-align:right">
    <div style="font-size:11px;color:#64748b">E-Commerce Maneka</div>
    <div style="font-size:10px;color:#475569">Generated ${new Date().toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})}</div>
  </div>
</div>
<div class="grand-totals">
  <div class="grand-box blue"><div class="grand-label">Total Store Profit</div><div class="grand-val">£${grandProfit.toFixed(2)}</div></div>
  <div class="grand-box green"><div class="grand-label">Total VA Earnings</div><div class="grand-val">£${grandVA.toFixed(2)}</div></div>
  <div class="grand-box red"><div class="grand-label">Total Penalties</div><div class="grand-val">£${grandPen.toFixed(2)}</div></div>
</div>
${vaRows}
<div class="footer">E-Commerce Maneka ERP &nbsp;·&nbsp; Confidential &nbsp;·&nbsp; ${monthLabel}</div>
<script>window.onload=function(){window.print();}<\/script>
</body></html>`;

    const w = window.open("","_blank");
    w.document.write(html);
    w.document.close();
  }

  function downloadSingleVAPDF(vaName, stores) {
    const monthLabel = (() => {
      const [yr, mo] = currentMonth.split("-");
      return `${MONTHS[parseInt(mo,10)-1]} ${yr}`;
    })();

    const totalProfit = stores.reduce((s,a)=>s+(parseFloat(getEntry(a.id).totalProfit)||0),0);
    const totalPen = stores.reduce((s,a)=>{const e=getEntry(a.id);return s+(parseFloat(e.hmrcFee)||0)+(parseFloat(e.counterfeit)||0)+(parseFloat(e.leavesPenalty)||0)+(parseFloat(e.feedbackDed)||0)+(parseFloat(e.lateArrival)||0)+(parseFloat(e.warningPenalty)||0)+(parseFloat(e.otherPenalty)||0);},0);
    const totalVA = stores.reduce((s,a)=>{const e=getEntry(a.id);const p=parseFloat(e.totalProfit)||0;const pen=(parseFloat(e.hmrcFee)||0)+(parseFloat(e.counterfeit)||0)+(parseFloat(e.leavesPenalty)||0)+(parseFloat(e.feedbackDed)||0)+(parseFloat(e.lateArrival)||0)+(parseFloat(e.warningPenalty)||0)+(parseFloat(e.otherPenalty)||0);return s+(p*(a.vaPct/100)-pen);},0);
    const depts = [...new Set(stores.map(a=>a.dept))];

    const deptColors={OnBuy:"#f97316",eBay:"#f59e0b",Amazon:"#ef4444","TikTok Shop":"#8b5cf6"};

    const storeRows = stores.map(a=>{
      const e=getEntry(a.id);
      const profit=parseFloat(e.totalProfit)||0;
      const hmrc=parseFloat(e.hmrcFee)||0;
      const cf=parseFloat(e.counterfeit)||0;
      const lp=parseFloat(e.leavesPenalty)||0;
      const fd=parseFloat(e.feedbackDed)||0;
      const la=parseFloat(e.lateArrival)||0;
      const wp=parseFloat(e.warningPenalty)||0;
      const op=parseFloat(e.otherPenalty)||0;
      const pen=hmrc+cf+lp+fd+la+wp+op;
      const vaEarn=(profit*(a.vaPct/100))-pen;
      const bank=a.bankName?`${a.bankName} · ${a.accountNo}${a.accountTitle?` · ${a.accountTitle}`:""}` :"—";
      const dc=deptColors[a.dept]||"#6366f1";

      const penDetails=[
        hmrc>0?`HMRC £${hmrc.toFixed(2)}`:"",
        cf>0?`Counterfeit £${cf.toFixed(2)}`:"",
        lp>0?`Leaves £${lp.toFixed(2)}`:"",
        fd>0?`Feedback £${fd.toFixed(2)}`:"",
        la>0?`Late £${la.toFixed(2)}`:"",
        wp>0?`Warning £${wp.toFixed(2)}`:"",
        op>0?`Other £${op.toFixed(2)}`:"",
      ].filter(Boolean).join(" · ")||"None";

      return `<tr>
        <td style="font-weight:600;color:#fff">${a.storeName}</td>
        <td><span style="background:${dc}22;color:${dc};padding:2px 7px;border-radius:4px;font-size:10px;font-weight:500">${a.dept}</span></td>
        <td style="color:#94a3b8">${a.clientPct}%</td>
        <td style="color:#94a3b8">${a.agencyPct}%</td>
        <td style="color:#94a3b8;font-weight:600">${a.vaPct}%</td>
        <td style="color:#e2e8f0;font-weight:600">£${profit.toFixed(2)}</td>
        <td style="color:#86efac;font-weight:700">£${vaEarn.toFixed(2)}</td>
        <td style="color:#f87171">£${pen.toFixed(2)}<br><span style="font-size:9px;color:#94a3b8">${penDetails}</span></td>
        <td style="color:#94a3b8;font-size:10px">${bank}</td>
      </tr>`;
    }).join("");

    const html=`<!DOCTYPE html><html><head><meta charset="UTF-8">
<title>${vaName} — ${monthLabel}</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{font-family:'Segoe UI',Arial,sans-serif;background:#0a0b11;color:#e2e8f0;padding:28px;font-size:12px}
  .header{display:flex;align-items:center;gap:16px;margin-bottom:24px;padding-bottom:16px;border-bottom:1px solid rgba(255,255,255,0.1)}
  .avatar{width:52px;height:52px;border-radius:13px;background:linear-gradient(135deg,#f59e0b,#f97316);display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:700;color:#fff;flex-shrink:0}
  .title{font-size:22px;font-weight:700;color:#fff}
  .subtitle{font-size:12px;color:#64748b;margin-top:3px}
  .meta{margin-left:auto;text-align:right}
  .meta-company{font-size:11px;color:#64748b}
  .meta-date{font-size:10px;color:#475569;margin-top:2px}
  .summary{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:24px}
  .sum-box{border-radius:11px;padding:16px}
  .sum-box.blue{background:rgba(99,102,241,0.15);border:1px solid rgba(99,102,241,0.3)}
  .sum-box.green{background:rgba(34,197,94,0.12);border:1px solid rgba(34,197,94,0.25)}
  .sum-box.red{background:rgba(239,68,68,0.12);border:1px solid rgba(239,68,68,0.25)}
  .sum-label{font-size:10px;text-transform:uppercase;letter-spacing:.07em;margin-bottom:6px}
  .sum-box.blue .sum-label{color:#818cf8}
  .sum-box.green .sum-label{color:#4ade80}
  .sum-box.red .sum-label{color:#f87171}
  .sum-val{font-size:22px;font-weight:700}
  .sum-box.blue .sum-val{color:#a5b4fc}
  .sum-box.green .sum-val{color:#86efac}
  .sum-box.red .sum-val{color:#f87171}
  .section-title{font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px}
  table{width:100%;border-collapse:collapse}
  th{text-align:left;padding:8px 10px;font-size:9px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:.07em;border-bottom:1px solid rgba(255,255,255,0.07);background:rgba(0,0,0,0.3)}
  td{padding:11px 10px;border-bottom:1px solid rgba(255,255,255,0.04);vertical-align:top}
  .table-wrap{background:#13151f;border:1px solid rgba(255,255,255,0.08);border-radius:12px;overflow:hidden;margin-bottom:20px}
  .footer{margin-top:20px;text-align:center;font-size:10px;color:#334155;border-top:1px solid rgba(255,255,255,0.06);padding-top:12px}
  @media print{
    body{background:#fff;color:#1e293b}
    .header{border-color:rgba(0,0,0,0.1)!important}
    .sum-box,.table-wrap{border-color:rgba(0,0,0,0.12)!important;background:rgba(0,0,0,0.03)!important}
    .title{color:#111827!important}
    .sum-val{color:#111827!important}
    .sum-box.green .sum-val{color:#16a34a!important}
    .sum-box.red .sum-val{color:#dc2626!important}
    td,th{color:#374151!important}
    .footer{border-color:rgba(0,0,0,0.1)!important;color:#9ca3af!important}
  }
</style></head><body>
<div class="header">
  <div class="avatar">${vaName[0].toUpperCase()}</div>
  <div>
    <div class="title">${vaName}</div>
    <div class="subtitle">${stores.length} store${stores.length>1?"s":""} &nbsp;·&nbsp; ${depts.join(", ")} &nbsp;·&nbsp; ${monthLabel}</div>
  </div>
  <div class="meta">
    <div class="meta-company">E-Commerce Maneka</div>
    <div class="meta-date">Generated ${new Date().toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"})}</div>
  </div>
</div>
<div class="summary">
  <div class="sum-box blue"><div class="sum-label">Total Store Profit</div><div class="sum-val">£${totalProfit.toFixed(2)}</div></div>
  <div class="sum-box green"><div class="sum-label">VA Net Earning</div><div class="sum-val">£${totalVA.toFixed(2)}</div></div>
  <div class="sum-box red"><div class="sum-label">Total Penalties</div><div class="sum-val">£${totalPen.toFixed(2)}</div></div>
</div>
<div class="section-title">Assigned Stores — ${monthLabel}</div>
<div class="table-wrap">
  <table>
    <thead><tr><th>Store</th><th>Dept</th><th>Client%</th><th>Agency%</th><th>VA%</th><th>Profit</th><th>VA Earning</th><th>Penalties</th><th>Bank</th></tr></thead>
    <tbody>${storeRows}</tbody>
  </table>
</div>
<div class="footer">E-Commerce Maneka ERP &nbsp;·&nbsp; Confidential &nbsp;·&nbsp; ${vaName} &nbsp;·&nbsp; ${monthLabel}</div>
<script>window.onload=function(){window.print();}<\/script>
</body></html>`;

    const w=window.open("","_blank");
    w.document.write(html);
    w.document.close();
  }

  // ── EMPLOYEES PANEL ──
  const EmployeesPanel = (
    <div style={{flex:1,overflowY:"auto",padding:"16px 26px"}}>
      <div style={{display:"flex",gap:2,marginBottom:20,borderBottom:"0.5px solid rgba(255,255,255,0.06)"}}>
        {(role==="admin"?[["va","🛒 VA List"]]:[["list","👔 Staff Employees"],["va","🛒 VA List"],["add","➕ Add Employee"],["trash","🗑️ Trash"]]).map(([id,lbl])=>(
          <button key={id} onClick={()=>setEmpTab(id)} style={{padding:"8px 18px",fontSize:12.5,cursor:"pointer",color:empTab===id?"#fff":"rgba(255,255,255,0.35)",borderBottom:empTab===id?"2px solid #6366f1":"2px solid transparent",background:"none",border:"none",borderBottom:empTab===id?"2px solid #6366f1":"2px solid transparent",fontFamily:"inherit",fontWeight:empTab===id?500:400,marginBottom:-0.5}}>{lbl}</button>
        ))}
      </div>

      {/* EMPLOYEE LIST */}
      {empTab==="list"&&(
        <div>
          <div style={{display:"flex",gap:8,marginBottom:16}}>
            <input value={empSearch} onChange={e=>setEmpSearch(e.target.value)} placeholder="Search employee..." style={{background:"rgba(255,255,255,0.06)",border:"0.5px solid rgba(255,255,255,0.1)",borderRadius:9,padding:"8px 14px",color:"#fff",fontSize:12.5,outline:"none",width:250,fontFamily:"inherit"}}/>
            <div style={{marginLeft:"auto",fontSize:12,color:"rgba(255,255,255,0.4)",lineHeight:"36px"}}>{employees.length} employees</div>
          </div>

          {employees.filter(e=>!empSearch||e.name.toLowerCase().includes(empSearch.toLowerCase())||e.designation?.toLowerCase().includes(empSearch.toLowerCase())).map(emp=>{
            const isOpen = selectedEmpId===emp.id;
            const history = salaryHistory[emp.id]||[];
            return (
              <div key={emp.id} style={{background:"#13151f",border:`0.5px solid ${isOpen?"#6366f1":"rgba(255,255,255,0.07)"}`,borderRadius:12,overflow:"hidden",marginBottom:10}}>
                {/* Summary row */}
                <div onClick={()=>{setSelectedEmpId(isOpen?null:emp.id);if(!isOpen)fetchSalaryHistory(emp.id);setEditEmpId(null);}} style={{display:"flex",alignItems:"center",padding:"14px 16px",cursor:"pointer",gap:12}}>
                  <div style={{width:38,height:38,borderRadius:10,background:"linear-gradient(135deg,#6366f1,#8b5cf6)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:700,color:"#fff",flexShrink:0}}>{emp.name[0].toUpperCase()}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:14,fontWeight:500,color:"#fff"}}>{emp.name}</div>
                    <div style={{fontSize:11,color:"rgba(255,255,255,0.4)",marginTop:2}}>{emp.designation||"—"} {emp.department?`· ${emp.department}`:""}</div>
                  </div>
                  <span style={{fontSize:10,padding:"3px 9px",borderRadius:5,background:empStatusColor(emp.status)+"22",color:empStatusColor(emp.status),fontWeight:500}}>{emp.status}</span>
                  <div style={{textAlign:"right",minWidth:100}}>
                    <div style={{fontSize:10,color:"rgba(255,255,255,0.3)"}}>Current Salary</div>
                    <div style={{fontSize:13,fontWeight:600,color:"#fcd34d"}}>Rs {Number(emp.base_salary_pkr||0).toLocaleString()}</div>
                    {emp.base_salary_gbp>0&&<div style={{fontSize:11,color:"#86efac"}}>£{Number(emp.base_salary_gbp||0).toFixed(0)}</div>}
                  </div>
                  <div onClick={e=>e.stopPropagation()} style={{display:"flex",gap:6}}>
                    <button onClick={()=>{setEditEmpId(emp.id);setEditEmp({...emp,joiningDate:emp.joining_date?emp.joining_date.split("T")[0]:"",dob:emp.dob?emp.dob.split("T")[0]:"",baseSalaryPkr:emp.base_salary_pkr,baseSalaryGbp:emp.base_salary_gbp,bankName:emp.bank_name,accountNo:emp.account_no,accountTitle:emp.account_title,emergencyContact:emp.emergency_contact,emergencyPhone:emp.emergency_phone,employmentType:emp.employment_type,salaryType:emp.salary_type});setSelectedEmpId(emp.id);fetchSalaryHistory(emp.id);}} style={{background:"rgba(99,102,241,0.12)",color:"#a5b4fc",border:"none",borderRadius:6,padding:"5px 12px",fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>Edit</button>
                    <button onClick={()=>deleteEmployee(emp.id)} style={{background:"rgba(239,68,68,0.1)",color:"#f87171",border:"none",borderRadius:6,padding:"5px 12px",fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>Delete</button>
                  </div>
                  <span style={{fontSize:16,color:"rgba(255,255,255,0.3)",display:"inline-block",transform:isOpen?"rotate(90deg)":"rotate(0deg)",transition:"transform 0.2s"}}>›</span>
                </div>

                {/* Expanded detail */}
                {isOpen&&(
                  <div style={{borderTop:"0.5px solid rgba(255,255,255,0.07)",padding:16}}>
                    {editEmpId===emp.id ? (
                      /* EDIT FORM */
                      <div>
                        <div style={{fontSize:11,color:"rgba(255,255,255,0.3)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>Personal Info</div>
                        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:12}}>
                          {[["name","Full Name *"],["cnic","CNIC / Passport"],["dob","Date of Birth"],["phone","Phone *"],["whatsapp","WhatsApp"],["email","Email"],["address","Address"],["city","City"]].map(([f,lbl])=>(
                            <div key={f}><div style={{fontSize:10.5,color:"rgba(255,255,255,0.4)",marginBottom:4}}>{lbl}</div>
                            <input value={editEmp[f]||""} onChange={e=>setEditEmp({...editEmp,[f]:e.target.value})} type={f==="dob"?"date":"text"} style={{width:"100%",background:"rgba(255,255,255,0.07)",border:"0.5px solid #6366f1",borderRadius:7,padding:"8px 10px",color:"#fff",fontSize:12.5,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/></div>
                          ))}
                          <div><div style={{fontSize:10.5,color:"rgba(255,255,255,0.4)",marginBottom:4}}>Gender</div>
                            <select value={editEmp.gender||"Male"} onChange={e=>setEditEmp({...editEmp,gender:e.target.value})} style={{width:"100%",background:"#1a1d2e",border:"0.5px solid #6366f1",borderRadius:7,padding:"8px 10px",color:"#fff",fontSize:12.5,fontFamily:"inherit",outline:"none"}}>
                              <option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
                            </select>
                          </div>
                          <div><div style={{fontSize:10.5,color:"rgba(255,255,255,0.4)",marginBottom:4}}>Status</div>
                            <select value={editEmp.status||"Active"} onChange={e=>setEditEmp({...editEmp,status:e.target.value})} style={{width:"100%",background:"#1a1d2e",border:"0.5px solid #6366f1",borderRadius:7,padding:"8px 10px",color:"#fff",fontSize:12.5,fontFamily:"inherit",outline:"none"}}>
                              <option value="Active">Active</option><option value="Probation">Probation</option><option value="Suspended">Suspended</option><option value="Left">Left</option>
                            </select>
                          </div>
                        </div>
                        <div style={{fontSize:11,color:"rgba(255,255,255,0.3)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10,marginTop:4}}>Job Info</div>
                        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:12}}>
                          {[["designation","Designation *"],["department","Department"],["joiningDate","Joining Date"]].map(([f,lbl])=>(
                            <div key={f}><div style={{fontSize:10.5,color:"rgba(255,255,255,0.4)",marginBottom:4}}>{lbl}</div>
                            <input value={editEmp[f]||""} onChange={e=>setEditEmp({...editEmp,[f]:e.target.value})} type={f==="joiningDate"?"date":"text"} style={{width:"100%",background:"rgba(255,255,255,0.07)",border:"0.5px solid #6366f1",borderRadius:7,padding:"8px 10px",color:"#fff",fontSize:12.5,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/></div>
                          ))}
                          <div><div style={{fontSize:10.5,color:"rgba(255,255,255,0.4)",marginBottom:4}}>Employment Type</div>
                            <select value={editEmp.employmentType||"Full-time"} onChange={e=>setEditEmp({...editEmp,employmentType:e.target.value})} style={{width:"100%",background:"#1a1d2e",border:"0.5px solid #6366f1",borderRadius:7,padding:"8px 10px",color:"#fff",fontSize:12.5,fontFamily:"inherit",outline:"none"}}>
                              <option value="Full-time">Full-time</option><option value="Part-time">Part-time</option><option value="Freelance">Freelance</option><option value="Contract">Contract</option>
                            </select>
                          </div>
                        </div>
                        <div style={{fontSize:11,color:"rgba(255,255,255,0.3)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10,marginTop:4}}>Bank & Salary</div>
                        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:12}}>
                          {[["bankName","Bank Name"],["accountNo","Account No / IBAN"],["accountTitle","Account Title"]].map(([f,lbl])=>(
                            <div key={f}><div style={{fontSize:10.5,color:"rgba(255,255,255,0.4)",marginBottom:4}}>{lbl}</div>
                            <input value={editEmp[f]||""} onChange={e=>setEditEmp({...editEmp,[f]:e.target.value})} style={{width:"100%",background:"rgba(255,255,255,0.07)",border:"0.5px solid #6366f1",borderRadius:7,padding:"8px 10px",color:"#fff",fontSize:12.5,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/></div>
                          ))}
                          <div><div style={{fontSize:10.5,color:"rgba(255,255,255,0.4)",marginBottom:4}}>Salary PKR</div>
                            <input type="number" value={editEmp.baseSalaryPkr||""} onChange={e=>setEditEmp({...editEmp,baseSalaryPkr:e.target.value})} style={{width:"100%",background:"rgba(255,255,255,0.07)",border:"0.5px solid #6366f1",borderRadius:7,padding:"8px 10px",color:"#fff",fontSize:12.5,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/></div>
                          <div><div style={{fontSize:10.5,color:"rgba(255,255,255,0.4)",marginBottom:4}}>Salary GBP</div>
                            <input type="number" value={editEmp.baseSalaryGbp||""} onChange={e=>setEditEmp({...editEmp,baseSalaryGbp:e.target.value})} style={{width:"100%",background:"rgba(255,255,255,0.07)",border:"0.5px solid #6366f1",borderRadius:7,padding:"8px 10px",color:"#fff",fontSize:12.5,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/></div>
                        </div>
                        <div style={{fontSize:11,color:"rgba(255,255,255,0.3)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10,marginTop:4}}>Emergency Contact</div>
                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
                          {[["emergencyContact","Name"],["emergencyPhone","Phone"]].map(([f,lbl])=>(
                            <div key={f}><div style={{fontSize:10.5,color:"rgba(255,255,255,0.4)",marginBottom:4}}>{lbl}</div>
                            <input value={editEmp[f]||""} onChange={e=>setEditEmp({...editEmp,[f]:e.target.value})} style={{width:"100%",background:"rgba(255,255,255,0.07)",border:"0.5px solid #6366f1",borderRadius:7,padding:"8px 10px",color:"#fff",fontSize:12.5,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/></div>
                          ))}
                        </div>
                        <div style={{marginBottom:14}}><div style={{fontSize:10.5,color:"rgba(255,255,255,0.4)",marginBottom:4}}>Notes</div>
                          <input value={editEmp.notes||""} onChange={e=>setEditEmp({...editEmp,notes:e.target.value})} style={{width:"100%",background:"rgba(255,255,255,0.07)",border:"0.5px solid #6366f1",borderRadius:7,padding:"8px 10px",color:"#fff",fontSize:12.5,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/></div>
                        <div style={{display:"flex",gap:8}}>
                          <button onClick={()=>saveEmpEdit(emp.id)} style={{background:"rgba(34,197,94,0.15)",color:"#86efac",border:"none",borderRadius:7,padding:"9px 20px",fontSize:12,cursor:"pointer",fontFamily:"inherit",fontWeight:500}}>Save ✓</button>
                          <button onClick={()=>{setEditEmpId(null);setEditEmp({});}} style={{background:"rgba(255,255,255,0.06)",color:"rgba(255,255,255,0.5)",border:"none",borderRadius:7,padding:"9px 14px",fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      /* VIEW MODE */
                      <div>
                        {/* Info cards */}
                        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
                          {[["📞",emp.phone||"—"],["📱",emp.whatsapp||"—"],["📧",emp.email||"—"],["🏙️",emp.city||"—"],["🪪",emp.cnic||"—"],["📅",emp.joining_date?emp.joining_date.split("T")[0]:"—"],["💼",emp.employment_type||"—"],["🚨",emp.emergency_contact?`${emp.emergency_contact} (${emp.emergency_phone||""})`:"—"]].map(([icon,val],i)=>(
                            <div key={i} style={{background:"rgba(255,255,255,0.03)",borderRadius:8,padding:10}}>
                              <div style={{fontSize:16,marginBottom:3}}>{icon}</div>
                              <div style={{fontSize:12,color:"#fff"}}>{val}</div>
                            </div>
                          ))}
                        </div>

                        {/* Bank details */}
                        {(emp.bank_name||emp.account_no)&&(
                          <div style={{background:"rgba(99,102,241,0.08)",border:"0.5px solid rgba(99,102,241,0.2)",borderRadius:9,padding:12,marginBottom:14}}>
                            <div style={{fontSize:10,color:"rgba(255,255,255,0.35)",marginBottom:6}}>🏦 BANK DETAILS</div>
                            <div style={{fontSize:13,color:"#fff"}}>{emp.bank_name} | {emp.account_no} | {emp.account_title}</div>
                          </div>
                        )}

                        {/* Current salary */}
                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:16}}>
                          <div style={{background:"rgba(252,211,77,0.1)",border:"0.5px solid rgba(252,211,77,0.2)",borderRadius:9,padding:12}}>
                            <div style={{fontSize:10,color:"rgba(255,255,255,0.35)",marginBottom:3}}>Current Salary PKR</div>
                            <div style={{fontSize:20,fontWeight:600,color:"#fcd34d"}}>Rs {Number(emp.base_salary_pkr||0).toLocaleString()}</div>
                          </div>
                          <div style={{background:"rgba(134,239,172,0.1)",border:"0.5px solid rgba(134,239,172,0.2)",borderRadius:9,padding:12}}>
                            <div style={{fontSize:10,color:"rgba(255,255,255,0.35)",marginBottom:3}}>Current Salary GBP</div>
                            <div style={{fontSize:20,fontWeight:600,color:"#86efac"}}>£{Number(emp.base_salary_gbp||0).toFixed(0)}</div>
                          </div>
                        </div>

                        {/* Salary History */}
                        <div style={{marginBottom:16}}>
                          <div style={{fontSize:11,color:"rgba(255,255,255,0.3)",textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:10}}>📈 Salary History</div>
                          {history.length===0?(
                            <div style={{fontSize:12,color:"rgba(255,255,255,0.3)"}}>No salary history yet</div>
                          ):(
                            <table style={{width:"100%",borderCollapse:"collapse",fontSize:12.5}}>
                              <thead><tr style={{borderBottom:"0.5px solid rgba(255,255,255,0.06)"}}>
                                {["Date","Salary PKR","Salary GBP","Reason"].map(h=>(
                                  <th key={h} style={{textAlign:"left",padding:"7px 10px",fontSize:10.5,fontWeight:500,color:"rgba(255,255,255,0.28)",textTransform:"uppercase"}}>{h}</th>
                                ))}
                              </tr></thead>
                              <tbody>
                                {history.map((h,i)=>(
                                  <tr key={i} style={{borderBottom:"0.5px solid rgba(255,255,255,0.04)",background:i===0?"rgba(99,102,241,0.06)":"transparent"}}>
                                    <td style={{padding:"8px 10px",color:i===0?"#a5b4fc":"rgba(255,255,255,0.6)"}}>{h.effective_date?.split("T")[0]} {i===0&&"(Current)"}</td>
                                    <td style={{padding:"8px 10px",color:"#fcd34d",fontWeight:i===0?600:400}}>Rs {Number(h.salary_pkr||0).toLocaleString()}</td>
                                    <td style={{padding:"8px 10px",color:"#86efac",fontWeight:i===0?600:400}}>£{Number(h.salary_gbp||0).toFixed(0)}</td>
                                    <td style={{padding:"8px 10px",color:"rgba(255,255,255,0.5)"}}>{h.reason||"—"}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </div>

                        {/* Salary Payments This Month */}
                        <div style={{marginBottom:16}}>
                          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                            <div style={{fontSize:11,color:"rgba(255,255,255,0.3)",textTransform:"uppercase",letterSpacing:"0.07em"}}>💳 Monthly Salary Payments</div>
                            <button onClick={()=>generateSalaryPayment(emp)} style={{background:"#6366f1",border:"none",borderRadius:7,padding:"6px 14px",color:"#fff",fontSize:11,cursor:"pointer",fontFamily:"inherit",fontWeight:500}}>+ Generate {MONTHS[parseInt(selMonth)-1]} Salary</button>
                          </div>
                          {salaryPayments.filter(p=>p.employee_id===emp.id).length===0?(
                            <div style={{fontSize:12,color:"rgba(255,255,255,0.3)"}}>No salary payments yet — click Generate to create</div>
                          ):(
                            <table style={{width:"100%",borderCollapse:"collapse",fontSize:12.5}}>
                              <thead><tr style={{borderBottom:"0.5px solid rgba(255,255,255,0.06)"}}>
                                {["Month","Year","Amount PKR","Amount GBP","Due Date","Status","Actions"].map(h=>(
                                  <th key={h} style={{textAlign:"left",padding:"7px 10px",fontSize:10,fontWeight:500,color:"rgba(255,255,255,0.28)",textTransform:"uppercase"}}>{h}</th>
                                ))}
                              </tr></thead>
                              <tbody>
                                {salaryPayments.filter(p=>p.employee_id===emp.id).map(p=>(
                                  <tr key={p.id} style={{borderBottom:"0.5px solid rgba(255,255,255,0.04)"}}>
                                    <td style={{padding:"8px 10px",color:"#fff"}}>{MONTHS[parseInt(p.month)-1]}</td>
                                    <td style={{padding:"8px 10px",color:"rgba(255,255,255,0.5)"}}>{p.year}</td>
                                    <td style={{padding:"8px 10px",color:"#fcd34d",fontWeight:500}}>Rs {Number(p.amount_pkr||0).toLocaleString()}</td>
                                    <td style={{padding:"8px 10px",color:"#86efac"}}>£{Number(p.amount_gbp||0).toFixed(0)}</td>
                                    <td style={{padding:"8px 10px",color:"rgba(255,255,255,0.5)",fontSize:11}}>{p.due_date?p.due_date.split("T")[0]:"5th"}</td>
                                    <td style={{padding:"8px 10px"}}>
                                      <select value={p.status||"Pending"} onChange={e=>updateSalaryStatus(p.id,e.target.value,e.target.value==="Paid"?new Date().toISOString().split("T")[0]:null)}
                                        style={{background:p.status==="Paid"?"rgba(34,197,94,0.15)":p.status==="Overdue"?"rgba(239,68,68,0.15)":"rgba(245,158,11,0.15)",border:"none",color:p.status==="Paid"?"#86efac":p.status==="Overdue"?"#f87171":"#fcd34d",borderRadius:6,padding:"4px 8px",fontSize:11,fontFamily:"inherit",outline:"none",cursor:"pointer"}}>
                                        <option value="Pending">Pending</option>
                                        <option value="Paid">Paid</option>
                                        <option value="Overdue">Overdue</option>
                                      </select>
                                    </td>
                                    <td style={{padding:"8px 10px"}}>
                                      <button onClick={()=>sendSalaryInvoice(emp,p)} style={{background:"rgba(99,102,241,0.12)",color:"#a5b4fc",border:"none",borderRadius:6,padding:"4px 10px",fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>📧 Send Slip</button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </div>

                        {/* Add Salary Increment */}
                        <div style={{background:"rgba(255,255,255,0.03)",border:"0.5px solid rgba(255,255,255,0.07)",borderRadius:10,padding:14,marginBottom:14}}>
                          <div style={{fontSize:11,color:"rgba(255,255,255,0.3)",textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:10}}>💰 Add Salary Increment</div>
                          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:8,marginBottom:10}}>
                            <div><div style={{fontSize:10.5,color:"rgba(255,255,255,0.4)",marginBottom:4}}>Effective Date</div>
                              <input type="date" value={newSalary.effectiveDate} onChange={e=>setNewSalary({...newSalary,effectiveDate:e.target.value})} style={{width:"100%",background:"rgba(255,255,255,0.07)",border:"0.5px solid rgba(255,255,255,0.12)",borderRadius:7,padding:"7px 9px",color:"#fff",fontSize:12,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/></div>
                            <div><div style={{fontSize:10.5,color:"rgba(255,255,255,0.4)",marginBottom:4}}>New Salary PKR</div>
                              <input type="number" placeholder="0" value={newSalary.salaryPkr} onChange={e=>setNewSalary({...newSalary,salaryPkr:e.target.value})} style={{width:"100%",background:"rgba(255,255,255,0.07)",border:"0.5px solid rgba(255,255,255,0.12)",borderRadius:7,padding:"7px 9px",color:"#fff",fontSize:12,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/></div>
                            <div><div style={{fontSize:10.5,color:"rgba(255,255,255,0.4)",marginBottom:4}}>New Salary GBP</div>
                              <input type="number" placeholder="0" value={newSalary.salaryGbp} onChange={e=>setNewSalary({...newSalary,salaryGbp:e.target.value})} style={{width:"100%",background:"rgba(255,255,255,0.07)",border:"0.5px solid rgba(255,255,255,0.12)",borderRadius:7,padding:"7px 9px",color:"#fff",fontSize:12,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/></div>
                            <div><div style={{fontSize:10.5,color:"rgba(255,255,255,0.4)",marginBottom:4}}>Reason</div>
                              <input placeholder="Annual increment..." value={newSalary.reason} onChange={e=>setNewSalary({...newSalary,reason:e.target.value})} style={{width:"100%",background:"rgba(255,255,255,0.07)",border:"0.5px solid rgba(255,255,255,0.12)",borderRadius:7,padding:"7px 9px",color:"#fff",fontSize:12,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/></div>
                          </div>
                          <button onClick={()=>addSalaryIncrement(emp.id)} style={{background:"#6366f1",border:"none",borderRadius:8,padding:"8px 20px",color:"#fff",fontSize:12,fontWeight:500,cursor:"pointer",fontFamily:"inherit"}}>+ Add Increment</button>
                        </div>

                        {emp.notes&&<div style={{fontSize:12,color:"rgba(255,255,255,0.4)",marginBottom:10}}>📝 {emp.notes}</div>}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* VA LIST TAB */}
      {empTab==="va"&&(
        <div>
          <div style={{display:"flex",gap:8,marginBottom:16,alignItems:"center"}}>
            <input value={vaSearch} onChange={e=>setVaSearch(e.target.value)} placeholder="Search VA or Store..." style={{background:"rgba(255,255,255,0.06)",border:"0.5px solid rgba(255,255,255,0.1)",borderRadius:9,padding:"8px 14px",color:"#fff",fontSize:12.5,outline:"none",width:250,fontFamily:"inherit"}}/>
            <button onClick={downloadVAListPDF} style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:6,background:"rgba(99,102,241,0.15)",border:"0.5px solid rgba(99,102,241,0.35)",borderRadius:8,padding:"7px 14px",color:"#a5b4fc",fontSize:12,cursor:"pointer",fontFamily:"inherit",fontWeight:500}}>
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v8M5 7l3 3 3-3M2 11v2a1 1 0 001 1h10a1 1 0 001-1v-2"/></svg>
              Download PDF
            </button>
            <div style={{fontSize:12,color:"rgba(255,255,255,0.4)",lineHeight:"36px"}}>{accounts.length} VAs / Stores</div>
          </div>

          {/* Group by VA name */}
          {(() => {
            const filtered = accounts.filter(a=>!vaSearch||a.vaName.toLowerCase().includes(vaSearch.toLowerCase())||a.storeName.toLowerCase().includes(vaSearch.toLowerCase()));
            // Group by vaName
            const grouped = {};
            filtered.forEach(a=>{
              if(!grouped[a.vaName]) grouped[a.vaName]=[];
              grouped[a.vaName].push(a);
            });
            return Object.entries(grouped).map(([vaName, stores])=>{
              const isOpen = selectedVAId===vaName;
              const totalProfit = stores.reduce((s,a)=>{const e=getEntry(a.id);return s+(parseFloat(e.totalProfit)||0);},0);
              const totalVAGBP = stores.reduce((s,a)=>{
                const e=getEntry(a.id);
                const profit=parseFloat(e.totalProfit)||0;
                const pen=(parseFloat(e.hmrcFee)||0)+(parseFloat(e.counterfeit)||0)+(parseFloat(e.leavesPenalty)||0)+(parseFloat(e.feedbackDed)||0)+(parseFloat(e.lateArrival)||0)+(parseFloat(e.warningPenalty)||0)+(parseFloat(e.otherPenalty)||0);
                return s+((profit*(a.vaPct/100))-pen);
              },0);
              const depts = [...new Set(stores.map(a=>a.dept))];

              return (
                <div key={vaName} style={{background:"#13151f",border:`0.5px solid ${isOpen?"#6366f1":"rgba(255,255,255,0.07)"}`,borderRadius:12,overflow:"hidden",marginBottom:10}}>
                  {/* VA Summary Row */}
                  <div onClick={()=>setSelectedVAId(isOpen?null:vaName)} style={{display:"flex",alignItems:"center",padding:"14px 16px",cursor:"pointer",gap:12}}>
                    <div style={{width:38,height:38,borderRadius:10,background:"linear-gradient(135deg,#f59e0b,#f97316)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:700,color:"#fff",flexShrink:0}}>{vaName[0].toUpperCase()}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:14,fontWeight:500,color:"#fff"}}>{vaName}</div>
                      <div style={{fontSize:11,color:"rgba(255,255,255,0.4)",marginTop:2}}>
                        {stores.length} store{stores.length>1?"s":""} · {depts.map(d=><span key={d} style={{fontSize:10,padding:"1px 6px",borderRadius:4,background:DEPT_COLORS[d]+"22",color:DEPT_COLORS[d],marginRight:4}}>{d}</span>)}
                      </div>
                    </div>
                    <div style={{textAlign:"right",minWidth:100}}>
                      <div style={{fontSize:10,color:"rgba(255,255,255,0.3)"}}>This Month Profit</div>
                      <div style={{fontSize:13,fontWeight:600,color:"#86efac"}}>£{totalVAGBP.toFixed(2)}</div>
                    </div>
                    <span style={{fontSize:16,color:"rgba(255,255,255,0.3)",display:"inline-block",transform:isOpen?"rotate(90deg)":"rotate(0deg)",transition:"transform 0.2s"}}>›</span>
                  </div>

                  {/* VA Detail */}
                  {isOpen&&(
                    <div style={{borderTop:"0.5px solid rgba(255,255,255,0.07)",padding:16}}>
                      {/* Stores table */}
                      <div style={{marginBottom:16}}>
                        <div style={{display:"flex",alignItems:"center",marginBottom:10}}>
                          <div style={{fontSize:11,color:"rgba(255,255,255,0.3)",textTransform:"uppercase",letterSpacing:"0.07em"}}>Assigned Stores</div>
                          <button onClick={e=>{e.stopPropagation();downloadSingleVAPDF(vaName,stores);}} style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:5,background:"rgba(99,102,241,0.12)",border:"0.5px solid rgba(99,102,241,0.3)",borderRadius:7,padding:"5px 11px",color:"#a5b4fc",fontSize:11,cursor:"pointer",fontFamily:"inherit",fontWeight:500}}>
                            <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v8M5 7l3 3 3-3M2 11v2a1 1 0 001 1h10a1 1 0 001-1v-2"/></svg>
                            Download PDF
                          </button>
                        </div>
                        <table style={{width:"100%",borderCollapse:"collapse",fontSize:12.5}}>
                          <thead><tr style={{borderBottom:"0.5px solid rgba(255,255,255,0.06)"}}>
                            {["Store","Dept","Client%","Agency%","VA%","This Month Profit","VA Earning","Penalties","Bank"].map(h=>(
                              <th key={h} style={{textAlign:"left",padding:"7px 10px",fontSize:10,fontWeight:500,color:"rgba(255,255,255,0.28)",textTransform:"uppercase"}}>{h}</th>
                            ))}
                          </tr></thead>
                          <tbody>
                            {stores.map(a=>{
                              const e=getEntry(a.id);
                              const profit=parseFloat(e.totalProfit)||0;
                              const pen=(parseFloat(e.hmrcFee)||0)+(parseFloat(e.counterfeit)||0)+(parseFloat(e.leavesPenalty)||0)+(parseFloat(e.feedbackDed)||0)+(parseFloat(e.lateArrival)||0)+(parseFloat(e.warningPenalty)||0)+(parseFloat(e.otherPenalty)||0);
                              const vaEarn=(profit*(a.vaPct/100))-pen;
                              return(
                                <tr key={a.id} style={{borderBottom:"0.5px solid rgba(255,255,255,0.04)"}}>
                                  <td style={{padding:"9px 10px",color:"#fff",fontWeight:500}}>{a.storeName}</td>
                                  <td style={{padding:"9px 10px"}}><span style={{fontSize:10,padding:"2px 7px",borderRadius:4,background:DEPT_COLORS[a.dept]+"22",color:DEPT_COLORS[a.dept]}}>{a.dept}</span></td>
                                  <td style={{padding:"9px 10px",color:"rgba(255,255,255,0.5)"}}>{a.clientPct}%</td>
                                  <td style={{padding:"9px 10px",color:"rgba(255,255,255,0.5)"}}>{a.agencyPct}%</td>
                                  <td style={{padding:"9px 10px",color:"rgba(255,255,255,0.5)"}}>{a.vaPct}%</td>
                                  <td style={{padding:"9px 10px",fontWeight:500}}>£{profit.toFixed(2)}</td>
                                  <td style={{padding:"9px 10px",color:"#86efac",fontWeight:600}}>£{vaEarn.toFixed(2)}</td>
                                  <td style={{padding:"9px 10px",color:"#f87171"}}>£{pen.toFixed(2)}</td>
                                  <td style={{padding:"9px 10px",color:"rgba(255,255,255,0.4)",fontSize:11}}>{a.bankName?`${a.bankName} | ${a.accountNo}`:"—"}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Monthly totals for this VA */}
                      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
                        <div style={{background:"rgba(99,102,241,0.1)",border:"0.5px solid rgba(99,102,241,0.2)",borderRadius:9,padding:12}}>
                          <div style={{fontSize:10,color:"rgba(255,255,255,0.35)",marginBottom:3}}>Total Store Profit</div>
                          <div style={{fontSize:16,fontWeight:600}}>£{totalProfit.toFixed(2)}</div>
                        </div>
                        <div style={{background:"rgba(134,239,172,0.1)",border:"0.5px solid rgba(134,239,172,0.2)",borderRadius:9,padding:12}}>
                          <div style={{fontSize:10,color:"rgba(255,255,255,0.35)",marginBottom:3}}>VA Net Earning</div>
                          <div style={{fontSize:16,fontWeight:600,color:"#86efac"}}>£{totalVAGBP.toFixed(2)}</div>
                        </div>
                        <div style={{background:"rgba(239,68,68,0.1)",border:"0.5px solid rgba(239,68,68,0.2)",borderRadius:9,padding:12}}>
                          <div style={{fontSize:10,color:"rgba(255,255,255,0.35)",marginBottom:3}}>Total Penalties</div>
                          <div style={{fontSize:16,fontWeight:600,color:"#f87171"}}>£{stores.reduce((s,a)=>{const e=getEntry(a.id);return s+(parseFloat(e.hmrcFee)||0)+(parseFloat(e.counterfeit)||0)+(parseFloat(e.leavesPenalty)||0)+(parseFloat(e.feedbackDed)||0)+(parseFloat(e.lateArrival)||0)+(parseFloat(e.warningPenalty)||0)+(parseFloat(e.otherPenalty)||0);},0).toFixed(2)}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            });
          })()}
        </div>
      )}

      {/* EMPLOYEE TRASH */}
      {empTab==="trash"&&(
        <div style={{background:"#13151f",border:"0.5px solid rgba(255,255,255,0.07)",borderRadius:12,overflow:"hidden"}}>
          <div style={{padding:"14px 16px",borderBottom:"0.5px solid rgba(255,255,255,0.06)",display:"flex",justifyContent:"space-between"}}>
            <span style={{fontSize:12.5,fontWeight:500}}>Employee Trash</span>
            <span style={{fontSize:11,color:"rgba(255,255,255,0.3)"}}>{empTrash.filter(e=>new Date(e.expiresAt)>new Date()).length} items — 30 days recovery</span>
          </div>
          {empTrash.filter(e=>new Date(e.expiresAt)>new Date()).length===0?(
            <div style={{padding:48,textAlign:"center",color:"rgba(255,255,255,0.25)",fontSize:13}}>Employee trash is empty</div>
          ):empTrash.filter(e=>new Date(e.expiresAt)>new Date()).map((emp,i)=>{
            const daysLeft=Math.ceil((new Date(emp.expiresAt)-new Date())/(1000*60*60*24));
            return(
              <div key={i} style={{display:"flex",alignItems:"center",padding:"12px 16px",borderBottom:"0.5px solid rgba(255,255,255,0.04)",gap:10}}>
                <div style={{width:34,height:34,borderRadius:9,background:"rgba(99,102,241,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:"#a5b4fc",flexShrink:0}}>{emp.name[0].toUpperCase()}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:500,color:"#fff"}}>{emp.name}</div>
                  <div style={{fontSize:11,color:"rgba(255,255,255,0.4)",marginTop:1}}>{emp.designation||"—"} · {emp.department||"—"}</div>
                </div>
                <span style={{fontSize:11,color:"rgba(255,255,255,0.4)"}}>{emp.phone||"—"}</span>
                <span style={{fontSize:12,fontWeight:500,color:daysLeft<=7?"#f87171":"#fcd34d"}}>{daysLeft}d left</span>
                <button onClick={()=>restoreEmployee(emp)} style={{background:"rgba(34,197,94,0.12)",color:"#86efac",border:"none",borderRadius:6,padding:"6px 14px",fontSize:11,cursor:"pointer",fontFamily:"inherit",fontWeight:500}}>Restore</button>
              </div>
            );
          })}
        </div>
      )}

      {/* ADD EMPLOYEE */}
      {empTab==="add"&&(
        <div style={{background:"#13151f",border:"0.5px solid rgba(255,255,255,0.07)",borderRadius:12,padding:24,maxWidth:900}}>
          <div style={{fontSize:13,fontWeight:500,marginBottom:16}}>Add New Employee</div>

          <div style={{fontSize:11,color:"rgba(255,255,255,0.3)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>Personal Information</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:14}}>
            {[["name","Full Name *"],["cnic","CNIC / Passport"],["phone","Phone *"],["whatsapp","WhatsApp"],["email","Email"],["address","Address"],["city","City"]].map(([f,lbl])=>(
              <div key={f}><div style={{fontSize:10.5,color:"rgba(255,255,255,0.4)",marginBottom:4}}>{lbl}</div>
              <input placeholder={lbl} value={newEmp[f]} onChange={e=>setNewEmp({...newEmp,[f]:e.target.value})} style={{width:"100%",background:"rgba(255,255,255,0.06)",border:"0.5px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"9px 10px",color:"#fff",fontSize:12.5,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/></div>
            ))}
            <div><div style={{fontSize:10.5,color:"rgba(255,255,255,0.4)",marginBottom:4}}>Date of Birth</div>
              <input type="date" value={newEmp.dob} onChange={e=>setNewEmp({...newEmp,dob:e.target.value})} style={{width:"100%",background:"rgba(255,255,255,0.06)",border:"0.5px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"9px 10px",color:"#fff",fontSize:12.5,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/></div>
            <div><div style={{fontSize:10.5,color:"rgba(255,255,255,0.4)",marginBottom:4}}>Gender</div>
              <select value={newEmp.gender} onChange={e=>setNewEmp({...newEmp,gender:e.target.value})} style={{width:"100%",background:"#1a1d2e",border:"0.5px solid rgba(255,255,255,0.15)",borderRadius:8,padding:"9px 10px",color:"#fff",fontSize:12.5,fontFamily:"inherit",outline:"none"}}>
                <option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div style={{fontSize:11,color:"rgba(255,255,255,0.3)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>Job Information</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:14}}>
            {[["designation","Designation *"],["department","Department"]].map(([f,lbl])=>(
              <div key={f}><div style={{fontSize:10.5,color:"rgba(255,255,255,0.4)",marginBottom:4}}>{lbl}</div>
              <input placeholder={lbl} value={newEmp[f]} onChange={e=>setNewEmp({...newEmp,[f]:e.target.value})} style={{width:"100%",background:"rgba(255,255,255,0.06)",border:"0.5px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"9px 10px",color:"#fff",fontSize:12.5,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/></div>
            ))}
            <div><div style={{fontSize:10.5,color:"rgba(255,255,255,0.4)",marginBottom:4}}>Joining Date *</div>
              <input type="date" value={newEmp.joiningDate} onChange={e=>setNewEmp({...newEmp,joiningDate:e.target.value})} style={{width:"100%",background:"rgba(255,255,255,0.06)",border:"0.5px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"9px 10px",color:"#fff",fontSize:12.5,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/></div>
            <div><div style={{fontSize:10.5,color:"rgba(255,255,255,0.4)",marginBottom:4}}>Employment Type</div>
              <select value={newEmp.employmentType} onChange={e=>setNewEmp({...newEmp,employmentType:e.target.value})} style={{width:"100%",background:"#1a1d2e",border:"0.5px solid rgba(255,255,255,0.15)",borderRadius:8,padding:"9px 10px",color:"#fff",fontSize:12.5,fontFamily:"inherit",outline:"none"}}>
                <option value="Full-time">Full-time</option><option value="Part-time">Part-time</option><option value="Freelance">Freelance</option><option value="Contract">Contract</option>
              </select>
            </div>
            <div><div style={{fontSize:10.5,color:"rgba(255,255,255,0.4)",marginBottom:4}}>Status</div>
              <select value={newEmp.status} onChange={e=>setNewEmp({...newEmp,status:e.target.value})} style={{width:"100%",background:"#1a1d2e",border:"0.5px solid rgba(255,255,255,0.15)",borderRadius:8,padding:"9px 10px",color:"#fff",fontSize:12.5,fontFamily:"inherit",outline:"none"}}>
                <option value="Active">Active</option><option value="Probation">Probation</option><option value="Suspended">Suspended</option>
              </select>
            </div>
          </div>

          <div style={{fontSize:11,color:"rgba(255,255,255,0.3)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>Bank & Salary</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:14}}>
            {[["bankName","Bank Name"],["accountNo","Account No / IBAN"],["accountTitle","Account Title"]].map(([f,lbl])=>(
              <div key={f}><div style={{fontSize:10.5,color:"rgba(255,255,255,0.4)",marginBottom:4}}>{lbl}</div>
              <input placeholder={lbl} value={newEmp[f]} onChange={e=>setNewEmp({...newEmp,[f]:e.target.value})} style={{width:"100%",background:"rgba(255,255,255,0.06)",border:"0.5px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"9px 10px",color:"#fff",fontSize:12.5,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/></div>
            ))}
            <div><div style={{fontSize:10.5,color:"rgba(255,255,255,0.4)",marginBottom:4}}>Base Salary PKR</div>
              <input type="number" placeholder="0" value={newEmp.baseSalaryPkr} onChange={e=>setNewEmp({...newEmp,baseSalaryPkr:e.target.value})} style={{width:"100%",background:"rgba(255,255,255,0.06)",border:"0.5px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"9px 10px",color:"#fff",fontSize:12.5,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/></div>
            <div><div style={{fontSize:10.5,color:"rgba(255,255,255,0.4)",marginBottom:4}}>Base Salary GBP</div>
              <input type="number" placeholder="0" value={newEmp.baseSalaryGbp} onChange={e=>setNewEmp({...newEmp,baseSalaryGbp:e.target.value})} style={{width:"100%",background:"rgba(255,255,255,0.06)",border:"0.5px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"9px 10px",color:"#fff",fontSize:12.5,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/></div>
          </div>

          <div style={{fontSize:11,color:"rgba(255,255,255,0.3)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>Emergency Contact</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
            {[["emergencyContact","Contact Name"],["emergencyPhone","Contact Phone"]].map(([f,lbl])=>(
              <div key={f}><div style={{fontSize:10.5,color:"rgba(255,255,255,0.4)",marginBottom:4}}>{lbl}</div>
              <input placeholder={lbl} value={newEmp[f]} onChange={e=>setNewEmp({...newEmp,[f]:e.target.value})} style={{width:"100%",background:"rgba(255,255,255,0.06)",border:"0.5px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"9px 10px",color:"#fff",fontSize:12.5,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/></div>
            ))}
          </div>

          <div style={{marginBottom:20}}><div style={{fontSize:10.5,color:"rgba(255,255,255,0.4)",marginBottom:5}}>Notes</div>
            <input placeholder="Any notes..." value={newEmp.notes} onChange={e=>setNewEmp({...newEmp,notes:e.target.value})} style={{width:"100%",background:"rgba(255,255,255,0.06)",border:"0.5px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"9px 12px",color:"#fff",fontSize:12.5,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/></div>

          <button onClick={addEmployee} style={{background:"#6366f1",border:"none",borderRadius:9,padding:"11px 32px",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>+ Add Employee</button>
        </div>
      )}
    </div>
  );

  // ── CLIENT FUNCTIONS ──
  async function addClient() {
    // Validation
    if (!newClient.name.trim()) return alert("Client name required!");
    const validStores = newClientStores.filter(s=>s.vaName.trim()&&s.storeName.trim());
    if (validStores.length===0) return alert("At least one store with VA Name and Store Name is required!");
    
    // Check all required fields
    for(let i=0;i<validStores.length;i++){
      const s=validStores[i];
      if(!s.vaName.trim()) return alert(`Store #${i+1}: VA Name required!`);
      if(!s.storeName.trim()) return alert(`Store #${i+1}: Store Name required!`);
      if(!s.clientPct||!s.agencyPct||!s.vaPct) return alert(`Store #${i+1}: All percentages required!`);
      const total = Number(s.clientPct)+Number(s.agencyPct)+Number(s.vaPct);
      if(total!==100) return alert(`Store #${i+1}: Percentages must add up to 100% (currently ${total}%)`);
    }

    try {
      // 1. Add client
      const cr = await fetch(`${API}/api/clients`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...newClient,companyNo:newClient.companyNo||""})});
      const client = await cr.json();
      if(!client.id) return alert("Error creating client: "+JSON.stringify(client));

      // 2. Add each store/VA and link to client
      for(const store of validStores){
        // Create account
        const ar = await fetch(`${API}/api/accounts`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
          vaName:store.vaName,
          storeName:store.storeName,
          dept:store.dept||"OnBuy",
          clientPct:Number(store.clientPct),
          agencyPct:Number(store.agencyPct),
          vaPct:Number(store.vaPct),
          bankName:store.bankName||"",
          accountNo:store.accountNo||"",
          bank:store.bank||""
        })});
        const acc = await ar.json();
        if(!acc.id) { console.error("Account error:",acc); continue; }

        // Link to client
        await fetch(`${API}/api/client-stores`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({clientId:client.id,accountId:acc.id})});
      }

      await fetchAll();
      setNewClient({name:"",company:"",companyNo:"",email:"",phone:"",address:"",joinDate:new Date().toISOString().split("T")[0],status:"Active",notes:""});
      setNewClientStores([{vaName:"",storeName:"",dept:"OnBuy",clientPct:60,agencyPct:20,vaPct:20,bankName:"",accountNo:"",bank:""}]);
      setClientTab("list");
      alert(`✅ ${client.name} added with ${validStores.length} store(s)!`);
    } catch(e) { alert("Error: "+e.message); }
  }

  async function saveClientEdit(id) {
    if (!editClient.name||!editClient.name.trim()) return alert("Client name required!");
    if (!editClient.company||!editClient.company.trim()) return alert("Company name required!");
    if (!editClient.email||!editClient.email.trim()) return alert("Email required!");
    if (!editClient.phone||!editClient.phone.trim()) return alert("Phone required!");
    for(let i=0;i<editClientStores.length;i++){
      const s=editClientStores[i];
      if(!s.vaName||!s.vaName.trim()) return alert(`Store #${i+1}: VA Name required!`);
      if(!s.storeName||!s.storeName.trim()) return alert(`Store #${i+1}: Store Name required!`);
      const total=Number(s.clientPct)+Number(s.agencyPct)+Number(s.vaPct);
      if(total!==100) return alert(`Store #${i+1}: Percentages must = 100% (currently ${total}%)`);
    }
    try {
      await fetch(`${API}/api/clients/${id}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({
        name:editClient.name,
        company:editClient.company||"",
        companyNo:editClient.companyNo||editClient.company_no||"",
        email:editClient.email||"",
        phone:editClient.phone||"",
        address:editClient.address||"",
        joinDate:editClient.join_date?(editClient.join_date.includes("T")?editClient.join_date.split("T")[0]:editClient.join_date):new Date().toISOString().split("T")[0],
        status:editClient.status||"Active",
        notes:editClient.notes||""
      })});
      setClients(prev=>prev.map(c=>c.id===id?{...c,...editClient}:c));
      setEditClientId(null); setEditClient({});
    } catch(e) { alert("Error saving client"); }
  }

  async function deleteClient(id) {
    if (!confirm("Move this client to trash?")) return;
    const c = clients.find(cl=>cl.id===id); if (!c) return;
    try {
      await fetch(`${API}/api/client-trash`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(c)});
      await fetch(`${API}/api/clients/${id}`,{method:"DELETE"});
      setClients(prev=>prev.filter(cl=>cl.id!==id));
      setClientStores(prev=>prev.filter(cs=>cs.client_id!==id));
      setSelectedClientId(null);
      await fetchAll();
      alert(`${c.name} moved to trash ✓`);
    } catch(e) { alert("Error: "+e.message); }
  }

  async function restoreClient(item) {
    try {
      const r = await fetch(`${API}/api/clients`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
        name:item.name, company:item.company||"", companyNo:item.company_no||"",
        email:item.email||"", phone:item.phone||"", address:item.address||"",
        joinDate:item.join_date?item.join_date.split("T")[0]:new Date().toISOString().split("T")[0],
        status:item.status||"Active", notes:item.notes||""
      })});
      const d = await r.json();
      await fetch(`${API}/api/client-trash/${item.original_id||item.id}`,{method:"DELETE"});
      setClients(prev=>[...prev,d]);
      setClientTrash(prev=>prev.filter(x=>(x.original_id||x.id)!==(item.original_id||item.id)));
      alert(`${item.name} restored ✓`);
    } catch(e) { alert("Error restoring"); }
  }

  async function linkStore(clientId) {
    if (!linkAccountId) return alert("Select a store!");
    try {
      await fetch(`${API}/api/client-stores`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({clientId,accountId:parseInt(linkAccountId)})});
      await fetchAll();
      setLinkAccountId("");
    } catch(e) {}
  }

  async function unlinkStore(csId) {
    try {
      await fetch(`${API}/api/client-stores/${csId}`,{method:"DELETE"});
      setClientStores(prev=>prev.filter(cs=>cs.id!==csId));
    } catch(e) {}
  }

  async function saveEmailConfig() {
    try {
      await fetch(`${API}/api/email-config`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(emailConfig)});
      alert("Email config saved!");
    } catch(e) {}
  }

  function previewInvoice(client, type) {
    const cStoreList = clientStores.filter(cs=>cs.client_id===client.id);
    const stores = cStoreList.map(cs=>{
      const e = getEntry(cs.account_id);
      const profit = parseFloat(e.totalProfit)||0;
      const penalties = (parseFloat(e.hmrcFee)||0)+(parseFloat(e.counterfeit)||0)+(parseFloat(e.leavesPenalty)||0)+(parseFloat(e.feedbackDed)||0)+(parseFloat(e.lateArrival)||0)+(parseFloat(e.warningPenalty)||0)+(parseFloat(e.otherPenalty)||0);
      const clientShare = profit*((cs.client_pct||60)/100);
      const agencyEarn = profit*((cs.agency_pct||20)/100);
      const vaEarning = (profit*((cs.va_pct||20)/100))-penalties;
      return {storeName:cs.store_name, vaName:cs.va_name, totalProfit:profit, penalties, clientShare, agencyEarn, vaEarning};
    });
    const totalProfit=stores.reduce((s,st)=>s+st.totalProfit,0);
    const totalClientShare=stores.reduce((s,st)=>s+st.clientShare,0);
    const totalAgency=stores.reduce((s,st)=>s+st.agencyEarn,0);
    const totalPenalties=stores.reduce((s,st)=>s+st.penalties,0);
    const totalVAEarning=stores.reduce((s,st)=>s+st.vaEarning,0);
    setInvoicePreview({client, type, stores, totals:{totalProfit,totalClientShare,totalAgency,totalPenalties,totalVAEarning}});
  }

  async function sendInvoice() {
    if (!invoicePreview) return;
    const {client, type, stores, totals} = invoicePreview;
    setSendingInvoice(`${client.id}_${type}`);
    try {
      const r = await fetch(`${API}/api/send-invoice`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
        clientEmail:client.email,
        clientName:type==="client"?client.name:(stores[0]?.vaName||client.name),
        month:selMonth, year:selYear,
        invoiceData:{stores, ...totals},
        type
      })});
      const d = await r.json();
      if(d.success) { alert(`✅ Invoice sent to ${client.email}`); setInvoicePreview(null); }
      else alert(`❌ ${d.error}`);
    } catch(e) { alert("Error sending invoice"); }
    setSendingInvoice(null);
  }

  async function markInvoicePending(client, type) {
    const key = entryKey(clientStores.find(cs=>cs.client_id===client.id)?.account_id);
    alert(`📋 Invoice marked as Pending for ${client.name} — ${type==="client"?"Client":"VA"}`);
    setInvoicePreview(null);
  }

  const statusColor=(s)=>s==="Active"?"#86efac":s==="Hold"?"#fcd34d":"#f87171";

  // ── CLIENTS PANEL ──
  const ClientsPanel = (
    <div style={{flex:1,overflowY:"auto",padding:"16px 26px"}}>
      <div style={{display:"flex",gap:2,marginBottom:20,borderBottom:"0.5px solid rgba(255,255,255,0.06)"}}>
        {[["list","👥 All Clients"],["add","➕ Add Client"],["trash","🗑️ Client Trash"],["email","📧 Email Setup"]].map(([id,lbl])=>(
          <button key={id} onClick={()=>setClientTab(id)} style={{padding:"8px 18px",fontSize:12.5,cursor:"pointer",color:clientTab===id?"#fff":"rgba(255,255,255,0.35)",borderBottom:clientTab===id?"2px solid #6366f1":"2px solid transparent",background:"none",border:"none",borderBottom:clientTab===id?"2px solid #6366f1":"2px solid transparent",fontFamily:"inherit",fontWeight:clientTab===id?500:400,marginBottom:-0.5}}>{lbl}</button>
        ))}
      </div>

      {clientTab==="list" && (
        <div>
          {clients.length===0?(
            <div style={{textAlign:"center",padding:48,color:"rgba(255,255,255,0.3)"}}>No clients yet — Add your first client!</div>
          ):clients.map(c=>{
            const cStores=clientStores.filter(cs=>cs.client_id===c.id);
            const isExpanded=selectedClientId===c.id;
            const totalProfit=cStores.reduce((s,cs)=>{const e=getEntry(cs.account_id);return s+(parseFloat(e.totalProfit)||0);},0);
            const totalClientShare=cStores.reduce((s,cs)=>{const e=getEntry(cs.account_id);const p=parseFloat(e.totalProfit)||0;return s+(p*(cs.client_pct/100));},0);
            return(
              <div key={c.id} style={{background:"#13151f",border:`0.5px solid ${isExpanded?"#6366f1":"rgba(255,255,255,0.07)"}`,borderRadius:12,overflow:"hidden",marginBottom:10}}>
                <div onClick={()=>{setSelectedClientId(isExpanded?null:c.id);setEditClientId(null);setEditClient({});}} style={{display:"flex",alignItems:"center",padding:"14px 16px",cursor:"pointer",gap:12}}>
                  <div style={{width:36,height:36,borderRadius:9,background:"linear-gradient(135deg,#6366f1,#8b5cf6)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:700,color:"#fff",flexShrink:0}}>{c.name[0].toUpperCase()}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:14,fontWeight:500,color:"#fff"}}>{c.name}</div>
                    <div style={{fontSize:11,color:"rgba(255,255,255,0.4)",marginTop:2}}>{c.company||"—"}{c.email?` · ${c.email}`:""}</div>
                  </div>
                  <span style={{fontSize:10,padding:"3px 9px",borderRadius:5,background:statusColor(c.status)+"22",color:statusColor(c.status),fontWeight:500}}>{c.status}</span>
                  {/* Department badges */}
                  <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                    {[...new Set(clientStores.filter(cs=>cs.client_id===c.id).map(cs=>cs.dept))].map(d=>(
                      <span key={d} style={{fontSize:10,padding:"2px 7px",borderRadius:4,background:DEPT_COLORS[d]+"22",color:DEPT_COLORS[d],fontWeight:500}}>{d}</span>
                    ))}
                  </div>
                  <div style={{textAlign:"right",minWidth:90}}>
                    <div style={{fontSize:10,color:"rgba(255,255,255,0.3)"}}>This month</div>
                    <div style={{fontSize:14,fontWeight:600,color:"#86efac"}}>£{totalClientShare.toFixed(2)}</div>
                  </div>
                  <span style={{fontSize:10,color:"rgba(255,255,255,0.3)",background:"rgba(255,255,255,0.06)",padding:"3px 8px",borderRadius:5}}>{cStores.length} stores</span>
                  <div onClick={e=>e.stopPropagation()} style={{display:"flex",gap:6}}>
                    <button onClick={async()=>{
                      await fetchAll();
                      setEditClient({
                        ...c,
                        companyNo: c.company_no||""
                      });
                      const fresh = await fetch(`${API}/api/client-stores`).then(r=>r.json());
                      const linkedStores = fresh.filter(cs=>cs.client_id===c.id);
                      setEditClientStores(linkedStores.map(cs=>({
                        csId: cs.id,
                        accountId: cs.account_id,
                        vaName: cs.va_name||"",
                        storeName: cs.store_name||"",
                        dept: cs.dept||"OnBuy",
                        clientPct: Number(cs.client_pct)||60,
                        agencyPct: Number(cs.agency_pct)||20,
                        vaPct: Number(cs.va_pct)||20
                      })));
                      setSelectedClientId(c.id);
                      setEditClientId(c.id);
                    }} style={{background:"rgba(99,102,241,0.12)",color:"#a5b4fc",border:"none",borderRadius:6,padding:"5px 12px",fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>Edit</button>
                    <button onClick={e=>{e.stopPropagation();deleteClient(c.id);}} style={{background:"rgba(239,68,68,0.1)",color:"#f87171",border:"none",borderRadius:6,padding:"5px 12px",fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>Delete</button>
                  </div>
                  <span style={{fontSize:16,color:"rgba(255,255,255,0.3)",display:"inline-block",transform:isExpanded?"rotate(90deg)":"rotate(0deg)",transition:"transform 0.2s"}}>›</span>
                </div>
                {isExpanded&&(
                  <div style={{borderTop:"0.5px solid rgba(255,255,255,0.07)",padding:16}}>
                    {editClientId===c.id?(
                      <div>
                        {/* Client Info */}
                        <div style={{fontSize:11,color:"rgba(255,255,255,0.3)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>Client Info</div>
                        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:10}}>
                          {[["name","Full Name"],["company","Company"],["companyNo","Co. Number"],["email","Email"],["phone","Phone"],["address","Address"]].map(([f,lbl])=>(
                            <div key={f}><div style={{fontSize:10.5,color:"rgba(255,255,255,0.4)",marginBottom:4}}>{lbl}</div><input value={editClient[f]||""} onChange={e=>setEditClient({...editClient,[f]:e.target.value})} style={{width:"100%",background:"rgba(255,255,255,0.08)",border:"0.5px solid #6366f1",borderRadius:7,padding:"8px 10px",color:"#fff",fontSize:12.5,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/></div>
                          ))}
                          <div><div style={{fontSize:10.5,color:"rgba(255,255,255,0.4)",marginBottom:4}}>Status</div>
                            <select value={editClient.status||"Active"} onChange={e=>setEditClient({...editClient,status:e.target.value})} style={{width:"100%",background:"#1a1d2e",border:"0.5px solid #6366f1",borderRadius:7,padding:"8px 10px",color:"#fff",fontSize:12.5,fontFamily:"inherit",outline:"none"}}>
                              <option value="Active">Active</option><option value="Hold">Hold</option><option value="Stopped">Stopped</option>
                            </select>
                          </div>
                          <div><div style={{fontSize:10.5,color:"rgba(255,255,255,0.4)",marginBottom:4}}>Join Date</div>
                            <input type="date" value={editClient.join_date?editClient.join_date.split("T")[0]:""} onChange={e=>setEditClient({...editClient,join_date:e.target.value})} style={{width:"100%",background:"rgba(255,255,255,0.08)",border:"0.5px solid #6366f1",borderRadius:7,padding:"8px 10px",color:"#fff",fontSize:12.5,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/>
                          </div>
                        </div>
                        <div style={{marginBottom:14}}><div style={{fontSize:10.5,color:"rgba(255,255,255,0.4)",marginBottom:4}}>Notes</div><input value={editClient.notes||""} onChange={e=>setEditClient({...editClient,notes:e.target.value})} style={{width:"100%",background:"rgba(255,255,255,0.08)",border:"0.5px solid #6366f1",borderRadius:7,padding:"8px 10px",color:"#fff",fontSize:12.5,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/></div>

                        {/* Linked Stores Edit */}
                        <div style={{borderTop:"0.5px solid rgba(255,255,255,0.07)",paddingTop:14,marginBottom:14}}>
                          <div style={{fontSize:11,color:"rgba(255,255,255,0.3)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>Linked Stores & VAs</div>
                          {editClientStores.map((store,idx)=>(
                            <div key={idx} style={{background:"rgba(255,255,255,0.03)",border:"0.5px solid rgba(255,255,255,0.07)",borderRadius:9,padding:12,marginBottom:8}}>
                              <div style={{fontSize:11,color:"rgba(255,255,255,0.4)",marginBottom:8}}>Store #{idx+1} — {store.storeName}</div>
                              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr 1fr",gap:8}}>
                                {[["vaName","VA Name"],["storeName","Store Name"],["clientPct","Client %"],["agencyPct","Agency %"],["vaPct","VA %"]].map(([f,lbl])=>(
                                  <div key={f}><div style={{fontSize:10,color:"rgba(255,255,255,0.35)",marginBottom:3}}>{lbl}</div>
                                  <input value={store[f]||""} onChange={e=>{const n=[...editClientStores];n[idx]={...n[idx],[f]:e.target.value};setEditClientStores(n);}} type={["clientPct","agencyPct","vaPct"].includes(f)?"number":"text"} style={{width:"100%",background:"rgba(255,255,255,0.06)",border:"0.5px solid #6366f1",borderRadius:6,padding:"6px 8px",color:"#fff",fontSize:12,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/></div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>

                        <div style={{display:"flex",gap:8}}>
                          <button onClick={async()=>{
                            await saveClientEdit(c.id);
                            // Update each linked account
                            for(const store of editClientStores){
                              if(store.accountId){
                                await fetch(`${API}/api/accounts/${store.accountId}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({vaName:store.vaName,storeName:store.storeName,dept:store.dept,clientPct:store.clientPct,agencyPct:store.agencyPct,vaPct:store.vaPct,bankName:"",accountNo:"",bank:""})});
                              }
                            }
                            await fetchAll();
                            setEditClientId(null);setEditClient({});setEditClientStores([]);
                          }} style={{background:"rgba(34,197,94,0.15)",color:"#86efac",border:"none",borderRadius:7,padding:"9px 20px",fontSize:12,cursor:"pointer",fontFamily:"inherit",fontWeight:500}}>Save All ✓</button>
                          <button onClick={()=>{setEditClientId(null);setEditClient({});setEditClientStores([]);}} style={{background:"rgba(255,255,255,0.06)",color:"rgba(255,255,255,0.5)",border:"none",borderRadius:7,padding:"9px 14px",fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Cancel</button>
                        </div>
                      </div>
                    ):(
                      <div>
                        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:14}}>
                          {[["📞 Phone",c.phone||"—"],["📧 Email",c.email||"—"],["🏢 Company",c.company||"—"],["🔢 Co. No",c.company_no||c.companyNo||"—"],["📅 Joined",c.join_date?c.join_date.split("T")[0]:"—"]].map(([lbl,val])=>(
                            <div key={lbl} style={{background:"rgba(255,255,255,0.03)",borderRadius:8,padding:10}}><div style={{fontSize:10,color:"rgba(255,255,255,0.35)",marginBottom:3}}>{lbl}</div><div style={{fontSize:12.5,color:"#fff"}}>{val}</div></div>
                          ))}
                        </div>
                        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:14}}>
                          <div style={{background:"rgba(99,102,241,0.1)",border:"0.5px solid rgba(99,102,241,0.2)",borderRadius:8,padding:12}}><div style={{fontSize:10,color:"rgba(255,255,255,0.35)",marginBottom:3}}>Total Profit</div><div style={{fontSize:16,fontWeight:600}}>£{totalProfit.toFixed(2)}</div></div>
                          <div style={{background:"rgba(34,197,94,0.1)",border:"0.5px solid rgba(34,197,94,0.2)",borderRadius:8,padding:12}}><div style={{fontSize:10,color:"rgba(255,255,255,0.35)",marginBottom:3}}>Client Share</div><div style={{fontSize:16,fontWeight:600,color:"#86efac"}}>£{totalClientShare.toFixed(2)}</div></div>
                          <div style={{background:"rgba(245,158,11,0.1)",border:"0.5px solid rgba(245,158,11,0.2)",borderRadius:8,padding:12}}><div style={{fontSize:10,color:"rgba(255,255,255,0.35)",marginBottom:3}}>Agency Earned</div><div style={{fontSize:16,fontWeight:600,color:"#fcd34d"}}>£{cStores.reduce((s,cs)=>{const e=getEntry(cs.account_id);const p=parseFloat(e.totalProfit)||0;return s+(p*(cs.agency_pct/100));},0).toFixed(2)}</div></div>
                        </div>
                        <div style={{marginBottom:12}}>
                          <div style={{fontSize:11,color:"rgba(255,255,255,0.3)",marginBottom:8,textTransform:"uppercase",letterSpacing:"0.07em"}}>Linked Stores ({cStores.length})</div>
                          {cStores.length===0?(<div style={{fontSize:12,color:"rgba(255,255,255,0.3)"}}>No stores linked yet</div>):(
                            <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
                              <thead><tr style={{borderBottom:"0.5px solid rgba(255,255,255,0.06)"}}>{["Store","VA","Profit","Client £","VA £","Remove"].map(h=>(<th key={h} style={{textAlign:"left",padding:"7px 10px",fontSize:10,fontWeight:500,color:"rgba(255,255,255,0.28)",textTransform:"uppercase"}}>{h}</th>))}</tr></thead>
                              <tbody>
                                {cStores.map(cs=>{
                                  const e=getEntry(cs.account_id);
                                  const p=parseFloat(e.totalProfit)||0;
                                  const pen=(parseFloat(e.hmrcFee)||0)+(parseFloat(e.counterfeit)||0)+(parseFloat(e.leavesPenalty)||0)+(parseFloat(e.feedbackDed)||0)+(parseFloat(e.lateArrival)||0)+(parseFloat(e.warningPenalty)||0)+(parseFloat(e.otherPenalty)||0);
                                  return(<tr key={cs.id} style={{borderBottom:"0.5px solid rgba(255,255,255,0.04)"}}>
                                    <td style={{padding:"8px 10px",color:"#fff",fontWeight:500}}>{cs.store_name}</td>
                                    <td style={{padding:"8px 10px",color:"rgba(255,255,255,0.5)"}}>{cs.va_name}</td>
                                    <td style={{padding:"8px 10px"}}>£{p.toFixed(2)}</td>
                                    <td style={{padding:"8px 10px",color:"#86efac",fontWeight:500}}>£{(p*(cs.client_pct/100)).toFixed(2)}</td>
                                    <td style={{padding:"8px 10px",color:"#a5b4fc"}}>£{((p*(cs.va_pct/100))-pen).toFixed(2)}</td>
                                    <td style={{padding:"8px 10px"}}><button onClick={()=>unlinkStore(cs.id)} style={{background:"rgba(239,68,68,0.1)",color:"#f87171",border:"none",borderRadius:5,padding:"4px 8px",fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>Remove</button></td>
                                  </tr>);
                                })}
                              </tbody>
                            </table>
                          )}
                        </div>
                        {c.email&&(
                          <div style={{display:"flex",gap:8,marginBottom:12}}>
                            <button onClick={()=>previewInvoice(c,"client")} style={{background:"rgba(99,102,241,0.15)",border:"0.5px solid rgba(99,102,241,0.3)",color:"#a5b4fc",borderRadius:8,padding:"8px 16px",fontSize:12,cursor:"pointer",fontFamily:"inherit",fontWeight:500}}>👁️ Client Invoice</button>
                            <button onClick={()=>previewInvoice(c,"va")} style={{background:"rgba(34,197,94,0.12)",border:"0.5px solid rgba(34,197,94,0.2)",color:"#86efac",borderRadius:8,padding:"8px 16px",fontSize:12,cursor:"pointer",fontFamily:"inherit",fontWeight:500}}>👁️ VA Salary Slip</button>
                          </div>
                        )}
                        {!c.email&&<div style={{fontSize:11,color:"rgba(255,255,255,0.3)",marginBottom:12}}>⚠️ Add email to send invoices</div>}
                        <div style={{display:"flex",gap:8}}>
                          <button onClick={()=>{setEditClientId(c.id);setEditClient({...c});}} style={{background:"rgba(99,102,241,0.12)",color:"#a5b4fc",border:"none",borderRadius:7,padding:"7px 14px",fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Edit</button>
                          <button onClick={()=>deleteClient(c.id)} style={{background:"rgba(239,68,68,0.1)",color:"#f87171",border:"none",borderRadius:7,padding:"7px 14px",fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Delete</button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {clientTab==="add"&&(
        <div style={{background:"#13151f",border:"0.5px solid rgba(255,255,255,0.07)",borderRadius:12,padding:24,maxWidth:800}}>
          <div style={{fontSize:13,fontWeight:500,marginBottom:16}}>Add New Client</div>

          {/* Client Info */}
          <div style={{fontSize:11,color:"rgba(255,255,255,0.3)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:10}}>Client Information</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12,marginBottom:12}}>
            {[["name","Full Name *"],["company","Company Name"],["companyNo","Company Number"],["email","Email Address"],["phone","Phone Number"],["address","Address"]].map(([f,lbl])=>(
              <div key={f}><div style={{fontSize:10.5,color:"rgba(255,255,255,0.4)",marginBottom:5}}>{lbl}</div><input placeholder={lbl} value={newClient[f]} onChange={e=>setNewClient({...newClient,[f]:e.target.value})} style={{width:"100%",background:"rgba(255,255,255,0.06)",border:"0.5px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"9px 12px",color:"#fff",fontSize:12.5,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/></div>
            ))}
            <div><div style={{fontSize:10.5,color:"rgba(255,255,255,0.4)",marginBottom:5}}>Join Date</div><input type="date" value={newClient.joinDate} onChange={e=>setNewClient({...newClient,joinDate:e.target.value})} style={{width:"100%",background:"rgba(255,255,255,0.06)",border:"0.5px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"9px 12px",color:"#fff",fontSize:12.5,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/></div>
            <div><div style={{fontSize:10.5,color:"rgba(255,255,255,0.4)",marginBottom:5}}>Status</div><select value={newClient.status} onChange={e=>setNewClient({...newClient,status:e.target.value})} style={{width:"100%",background:"#1a1d2e",border:"0.5px solid rgba(255,255,255,0.15)",borderRadius:8,padding:"9px 12px",color:"#fff",fontSize:12.5,fontFamily:"inherit",outline:"none"}}><option value="Active">Active</option><option value="Hold">Hold</option><option value="Stopped">Stopped</option></select></div>
          </div>
          <div style={{marginBottom:20}}><div style={{fontSize:10.5,color:"rgba(255,255,255,0.4)",marginBottom:5}}>Notes</div><input placeholder="Any notes..." value={newClient.notes} onChange={e=>setNewClient({...newClient,notes:e.target.value})} style={{width:"100%",background:"rgba(255,255,255,0.06)",border:"0.5px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"9px 12px",color:"#fff",fontSize:12.5,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/></div>

          {/* Stores / VAs */}
          <div style={{borderTop:"0.5px solid rgba(255,255,255,0.07)",paddingTop:18,marginBottom:16}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
              <div style={{fontSize:11,color:"rgba(255,255,255,0.3)",textTransform:"uppercase",letterSpacing:"0.08em"}}>Stores & VAs ({newClientStores.length})</div>
              <button onClick={()=>setNewClientStores(prev=>[...prev,{vaName:"",storeName:"",dept:"OnBuy",clientPct:60,agencyPct:20,vaPct:20,bankName:"",accountNo:"",bank:""}])} style={{background:"rgba(99,102,241,0.15)",color:"#a5b4fc",border:"0.5px solid rgba(99,102,241,0.3)",borderRadius:7,padding:"5px 14px",fontSize:12,cursor:"pointer",fontFamily:"inherit",fontWeight:500}}>+ Add Store</button>
            </div>

            {newClientStores.map((store,idx)=>(
              <div key={idx} style={{background:"rgba(255,255,255,0.03)",border:"0.5px solid rgba(255,255,255,0.07)",borderRadius:10,padding:14,marginBottom:10}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                  <div style={{fontSize:12,fontWeight:500,color:"rgba(255,255,255,0.6)"}}>Store #{idx+1}</div>
                  {newClientStores.length>1&&<button onClick={()=>setNewClientStores(prev=>prev.filter((_,i)=>i!==idx))} style={{background:"rgba(239,68,68,0.1)",color:"#f87171",border:"none",borderRadius:6,padding:"4px 10px",fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>Remove</button>}
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:10}}>
                  <div><div style={{fontSize:10.5,color:"rgba(255,255,255,0.4)",marginBottom:4}}>VA Name *</div><input placeholder="VA Name" value={store.vaName} onChange={e=>{const n=[...newClientStores];n[idx]={...n[idx],vaName:e.target.value};setNewClientStores(n);}} style={{width:"100%",background:"rgba(255,255,255,0.06)",border:"0.5px solid rgba(255,255,255,0.12)",borderRadius:7,padding:"8px 10px",color:"#fff",fontSize:12.5,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/></div>
                  <div><div style={{fontSize:10.5,color:"rgba(255,255,255,0.4)",marginBottom:4}}>Store Name *</div><input placeholder="Store Name" value={store.storeName} onChange={e=>{const n=[...newClientStores];n[idx]={...n[idx],storeName:e.target.value};setNewClientStores(n);}} style={{width:"100%",background:"rgba(255,255,255,0.06)",border:"0.5px solid rgba(255,255,255,0.12)",borderRadius:7,padding:"8px 10px",color:"#fff",fontSize:12.5,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/></div>
                  <div><div style={{fontSize:10.5,color:"rgba(255,255,255,0.4)",marginBottom:4}}>Department</div><select value={store.dept} onChange={e=>{const n=[...newClientStores];n[idx]={...n[idx],dept:e.target.value};setNewClientStores(n);}} style={{width:"100%",background:"#1a1d2e",border:"0.5px solid rgba(255,255,255,0.12)",borderRadius:7,padding:"8px 10px",color:"#fff",fontSize:12.5,fontFamily:"inherit",outline:"none"}}><option value="OnBuy">OnBuy</option><option value="eBay">eBay</option><option value="Amazon">Amazon</option><option value="TikTok Shop">TikTok Shop</option></select></div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr 1fr 1fr",gap:8}}>
                  {[["clientPct","Client %"],["agencyPct","Agency %"],["vaPct","VA %"],["bankName","Bank"],["accountNo","Acc/IBAN"],["bank","Acc Title"]].map(([f,lbl])=>(
                    <div key={f}><div style={{fontSize:10,color:"rgba(255,255,255,0.35)",marginBottom:3}}>{lbl}</div><input value={store[f]} onChange={e=>{const n=[...newClientStores];n[idx]={...n[idx],[f]:e.target.value};setNewClientStores(n);}} type={["clientPct","agencyPct","vaPct"].includes(f)?"number":"text"} style={{width:"100%",background:"rgba(255,255,255,0.06)",border:"0.5px solid rgba(255,255,255,0.1)",borderRadius:7,padding:"7px 8px",color:"#fff",fontSize:12,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/></div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button onClick={addClient} style={{background:"#6366f1",border:"none",borderRadius:9,padding:"11px 32px",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>+ Add Client & Stores</button>
        </div>
      )}

      {clientTab==="trash"&&(
        <div style={{background:"#13151f",border:"0.5px solid rgba(255,255,255,0.07)",borderRadius:12,overflow:"hidden"}}>
          <div style={{padding:"14px 16px",borderBottom:"0.5px solid rgba(255,255,255,0.06)",display:"flex",justifyContent:"space-between"}}>
            <span style={{fontSize:12.5,fontWeight:500}}>Client Trash</span>
            <span style={{fontSize:11,color:"rgba(255,255,255,0.3)"}}>{clientTrash.filter(c=>new Date(c.expiresAt)>new Date()).length} items — 30 days recovery</span>
          </div>
          {clientTrash.filter(c=>new Date(c.expiresAt)>new Date()).length===0?(
            <div style={{padding:48,textAlign:"center",color:"rgba(255,255,255,0.25)",fontSize:13}}>Client trash is empty</div>
          ):clientTrash.filter(c=>new Date(c.expiresAt)>new Date()).map((c,i)=>{
            const daysLeft=Math.ceil((new Date(c.expiresAt)-new Date())/(1000*60*60*24));
            return(
              <div key={i} style={{display:"flex",alignItems:"center",padding:"12px 16px",borderBottom:"0.5px solid rgba(255,255,255,0.04)",gap:10}}>
                <div style={{width:32,height:32,borderRadius:8,background:"rgba(99,102,241,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:700,color:"#a5b4fc",flexShrink:0}}>{c.name[0].toUpperCase()}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:500,color:"#fff"}}>{c.name}</div>
                  <div style={{fontSize:11,color:"rgba(255,255,255,0.4)",marginTop:1}}>{c.company||"—"} {c.email?`· ${c.email}`:""}</div>
                </div>
                <span style={{fontSize:12,fontWeight:500,color:daysLeft<=7?"#f87171":"#fcd34d"}}>{daysLeft}d left</span>
                <button onClick={()=>restoreClient(c)} style={{background:"rgba(34,197,94,0.12)",color:"#86efac",border:"none",borderRadius:6,padding:"6px 14px",fontSize:11,cursor:"pointer",fontFamily:"inherit",fontWeight:500}}>Restore</button>
              </div>
            );
          })}
        </div>
      )}

      {clientTab==="email"&&(
        <div style={{background:"#13151f",border:"0.5px solid rgba(255,255,255,0.07)",borderRadius:12,padding:24,maxWidth:500}}>
          <div style={{fontSize:13,fontWeight:500,marginBottom:6}}>📧 Gmail Setup for Invoices</div>
          <div style={{fontSize:11,color:"rgba(255,255,255,0.35)",marginBottom:20}}>Use a Gmail account to send invoices automatically.</div>
          <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:16}}>
            <div><div style={{fontSize:10.5,color:"rgba(255,255,255,0.4)",marginBottom:5}}>Gmail Address</div><input placeholder="your@gmail.com" value={emailConfig.user} onChange={e=>setEmailConfig({...emailConfig,user:e.target.value})} style={{width:"100%",background:"rgba(255,255,255,0.06)",border:"0.5px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"9px 12px",color:"#fff",fontSize:12.5,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/></div>
            <div><div style={{fontSize:10.5,color:"rgba(255,255,255,0.4)",marginBottom:5}}>App Password (16 characters)</div><input type="password" placeholder="xxxx xxxx xxxx xxxx" value={emailConfig.pass} onChange={e=>setEmailConfig({...emailConfig,pass:e.target.value})} style={{width:"100%",background:"rgba(255,255,255,0.06)",border:"0.5px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"9px 12px",color:"#fff",fontSize:12.5,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/></div>
          </div>
          <button onClick={saveEmailConfig} style={{background:"#6366f1",border:"none",borderRadius:9,padding:"10px 24px",color:"#fff",fontSize:13,fontWeight:500,cursor:"pointer",fontFamily:"inherit"}}>Save Email Config</button>
          <div style={{marginTop:16,background:"rgba(245,158,11,0.08)",border:"0.5px solid rgba(245,158,11,0.2)",borderRadius:8,padding:12}}>
            <div style={{fontSize:11,color:"#fcd34d",fontWeight:500,marginBottom:4}}>⚠️ How to get App Password:</div>
            <div style={{fontSize:11,color:"rgba(255,255,255,0.5)"}}>1. Google Account → Security → 2-Step Verification ON</div>
            <div style={{fontSize:11,color:"rgba(255,255,255,0.5)"}}>2. Search "App passwords" → Create one</div>
            <div style={{fontSize:11,color:"rgba(255,255,255,0.5)"}}>3. Copy 16-character password and paste above</div>
          </div>
        </div>
      )}
    </div>
  );

  // ── FINANCE PANEL ──
  const EXP_CATS = ["All","Rent","Salary","Software","Marketing","Travel","Utilities","Equipment","Tax","Other"];
  const CAT_COLORS = {Rent:"#f97316",Salary:"#6366f1",Software:"#8b5cf6",Marketing:"#ec4899",Travel:"#06b6d4",Utilities:"#f59e0b",Equipment:"#22c55e",Tax:"#ef4444",Other:"#94a3b8"};

  const now = new Date();
  const thisMonthStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}`;
  const thisYearStr = `${now.getFullYear()}`;

  const filteredExp = expenses.filter(e=> expFilter==="All"||e.category===expFilter);
  const expThisMonth = expenses.filter(e=>e.date&&e.date.startsWith(thisMonthStr)).reduce((s,e)=>s+(parseFloat(e.amount_pkr)||0),0);
  const expThisYear  = expenses.filter(e=>e.date&&e.date.startsWith(thisYearStr)).reduce((s,e)=>s+(parseFloat(e.amount_pkr)||0),0);
  const expAllTime   = expenses.reduce((s,e)=>s+(parseFloat(e.amount_pkr)||0),0);
  const donActive    = donations.filter(d=>d.status==="Active");
  const donTotalPKR  = donActive.reduce((s,d)=>s+(parseFloat(d.monthly_amount)||0),0);

  async function saveExpense() {
    if (!newExp.description) return alert("Description required");
    try {
      const r = await fetch(`${API}/api/expenses`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({date:newExp.date,category:newExp.category,description:newExp.description,amountGbp:0,amountPkr:parseFloat(newExp.amountPkr)||0,currency:"PKR",notes:newExp.notes,createdBy:currentUser})});
      const d = await r.json();
      if (d.id) { setExpenses(prev=>[d,...prev]); setShowAddExp(false); setNewExp({date:new Date().toISOString().split("T")[0],category:"Other",description:"",amountPkr:"",notes:""}); }
    } catch(e) { alert("Error saving expense"); }
  }

  async function updateExpense(id) {
    try {
      await fetch(`${API}/api/expenses/${id}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({date:editExp.date,category:editExp.category,description:editExp.description,amountGbp:0,amountPkr:parseFloat(editExp.amount_pkr)||0,currency:"PKR",notes:editExp.notes||""})});
      setExpenses(prev=>prev.map(e=>e.id===id?{...e,...editExp,amount_gbp:parseFloat(editExp.amount_gbp)||0,amount_pkr:parseFloat(editExp.amount_pkr)||0}:e));
      setEditExpId(null);
    } catch(e) { alert("Error updating"); }
  }

  async function deleteExpense(id) {
    if (!confirm("Delete this expense?")) return;
    await fetch(`${API}/api/expenses/${id}`,{method:"DELETE"});
    setExpenses(prev=>prev.filter(e=>e.id!==id));
  }

  async function saveDonation() {
    if (!newDon.name) return alert("Name required");
    try {
      const r = await fetch(`${API}/api/donations`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:newDon.name,address:newDon.address,bankName:newDon.bankName,accountNo:newDon.accountNo,accountTitle:newDon.accountTitle,monthlyAmount:parseFloat(newDon.monthlyAmount)||0,currency:newDon.currency,paymentMethod:newDon.paymentMethod,status:newDon.status,notes:newDon.notes})});
      const d = await r.json();
      if (d.id) { setDonations(prev=>[...prev,d]); setShowAddDon(false); setNewDon({name:"",address:"",bankName:"",accountNo:"",accountTitle:"",monthlyAmount:"",currency:"PKR",paymentMethod:"Bank Transfer",status:"Active",notes:""}); }
    } catch(e) { alert("Error saving"); }
  }

  async function updateDonation(id) {
    try {
      await fetch(`${API}/api/donations/${id}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:editDon.name,address:editDon.address||"",bankName:editDon.bank_name||"",accountNo:editDon.account_no||"",accountTitle:editDon.account_title||"",monthlyAmount:parseFloat(editDon.monthly_amount)||0,currency:editDon.currency||"PKR",paymentMethod:editDon.payment_method||"Bank Transfer",status:editDon.status||"Active",notes:editDon.notes||""})});
      setDonations(prev=>prev.map(d=>d.id===id?{...d,...editDon,monthly_amount:parseFloat(editDon.monthly_amount)||0}:d));
      setEditDonId(null);
    } catch(e) { alert("Error updating"); }
  }

  async function deleteDonation(id) {
    if (!confirm("Delete this donation recipient?")) return;
    await fetch(`${API}/api/donations/${id}`,{method:"DELETE"});
    setDonations(prev=>prev.filter(d=>d.id!==id));
  }

  const inp = {width:"100%",background:"rgba(255,255,255,0.06)",border:"0.5px solid rgba(255,255,255,0.1)",borderRadius:8,padding:"8px 10px",color:"#fff",fontSize:12.5,outline:"none",fontFamily:"inherit",boxSizing:"border-box"};
  const sel = {...inp,background:"#1a1d2e",border:"0.5px solid rgba(255,255,255,0.15)"};

  const FinancePanel = (
    <div style={{flex:1,overflowY:"auto",padding:"16px 26px"}}>
      {/* Tabs */}
      <div style={{display:"flex",gap:2,marginBottom:20,borderBottom:"0.5px solid rgba(255,255,255,0.06)"}}>
        {[["expenses","💸 Expenses"],["donations","🤲 Donations"]].map(([id,lbl])=>(
          <button key={id} onClick={()=>setFinanceTab(id)} style={{padding:"8px 18px",fontSize:12.5,cursor:"pointer",color:financeTab===id?"#fff":"rgba(255,255,255,0.35)",background:"none",border:"none",borderBottom:financeTab===id?"2px solid #6366f1":"2px solid transparent",fontFamily:"inherit",fontWeight:financeTab===id?500:400,marginBottom:-0.5}}>{lbl}</button>
        ))}
      </div>

      {/* ── EXPENSES TAB ── */}
      {financeTab==="expenses"&&(
        <div>
          {/* Summary Cards */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:20}}>
            {[
              {label:"This Month",val:`₨${Math.round(expThisMonth).toLocaleString()}`,color:"#6366f1",bg:"rgba(99,102,241,0.1)",border:"rgba(99,102,241,0.2)"},
              {label:"This Year",val:`₨${Math.round(expThisYear).toLocaleString()}`,color:"#f59e0b",bg:"rgba(245,158,11,0.1)",border:"rgba(245,158,11,0.2)"},
              {label:"All Time",val:`₨${Math.round(expAllTime).toLocaleString()}`,color:"#ef4444",bg:"rgba(239,68,68,0.1)",border:"rgba(239,68,68,0.2)"},
            ].map(c=>(
              <div key={c.label} style={{background:c.bg,border:`0.5px solid ${c.border}`,borderRadius:12,padding:16}}>
                <div style={{fontSize:10,color:"rgba(255,255,255,0.35)",textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:4}}>{c.label}</div>
                <div style={{fontSize:22,fontWeight:700,color:c.color}}>{c.val}</div>
              </div>
            ))}
          </div>

          {/* Category filter + Add button */}
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14,flexWrap:"wrap"}}>
            {EXP_CATS.map(cat=>(
              <button key={cat} onClick={()=>setExpFilter(cat)} style={{padding:"4px 12px",fontSize:11.5,borderRadius:6,cursor:"pointer",fontFamily:"inherit",border:`0.5px solid ${expFilter===cat?(CAT_COLORS[cat]||"#6366f1"):"rgba(255,255,255,0.1)"}`,background:expFilter===cat?`${CAT_COLORS[cat]||"#6366f1"}22`:"transparent",color:expFilter===cat?(CAT_COLORS[cat]||"#6366f1"):"rgba(255,255,255,0.4)",fontWeight:expFilter===cat?500:400}}>{cat}</button>
            ))}
            <button onClick={()=>{setShowAddExp(v=>!v);setEditExpId(null);}} style={{marginLeft:"auto",background:"rgba(99,102,241,0.15)",border:"0.5px solid rgba(99,102,241,0.35)",borderRadius:8,padding:"6px 14px",color:"#a5b4fc",fontSize:12,cursor:"pointer",fontFamily:"inherit",fontWeight:500}}>
              {showAddExp?"✕ Cancel":"＋ Add Expense"}
            </button>
          </div>

          {/* Add Expense Form */}
          {showAddExp&&(
            <div style={{background:"#13151f",border:"0.5px solid rgba(99,102,241,0.25)",borderRadius:12,padding:16,marginBottom:14}}>
              <div style={{fontSize:12,fontWeight:500,marginBottom:12,color:"#a5b4fc"}}>New Expense</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 2fr 1fr",gap:8,marginBottom:10}}>
                <div><div style={{fontSize:10,color:"rgba(255,255,255,0.35)",marginBottom:3}}>Date</div><input type="date" value={newExp.date} onChange={e=>setNewExp({...newExp,date:e.target.value})} style={inp}/></div>
                <div><div style={{fontSize:10,color:"rgba(255,255,255,0.35)",marginBottom:3}}>Category</div>
                  <select value={newExp.category} onChange={e=>setNewExp({...newExp,category:e.target.value})} style={sel}>
                    {EXP_CATS.slice(1).map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
                <div><div style={{fontSize:10,color:"rgba(255,255,255,0.35)",marginBottom:3}}>Description *</div><input placeholder="Description" value={newExp.description} onChange={e=>setNewExp({...newExp,description:e.target.value})} style={inp}/></div>
                <div><div style={{fontSize:10,color:"rgba(255,255,255,0.35)",marginBottom:3}}>Amount PKR</div><input type="number" placeholder="0" value={newExp.amountPkr} onChange={e=>setNewExp({...newExp,amountPkr:e.target.value})} style={inp}/></div>
              </div>
              <div style={{display:"flex",gap:8,alignItems:"flex-end"}}>
                <div style={{flex:1}}><div style={{fontSize:10,color:"rgba(255,255,255,0.35)",marginBottom:3}}>Notes (optional)</div><input placeholder="Notes..." value={newExp.notes} onChange={e=>setNewExp({...newExp,notes:e.target.value})} style={inp}/></div>
                <button onClick={saveExpense} style={{background:"#6366f1",border:"none",borderRadius:8,padding:"9px 20px",color:"#fff",fontSize:12.5,fontWeight:500,cursor:"pointer",fontFamily:"inherit"}}>Save</button>
              </div>
            </div>
          )}

          {/* Expenses Table */}
          <div style={{background:"#13151f",border:"0.5px solid rgba(255,255,255,0.07)",borderRadius:12,overflow:"hidden"}}>
            {filteredExp.length===0?(
              <div style={{padding:48,textAlign:"center",color:"rgba(255,255,255,0.25)",fontSize:13}}>No expenses{expFilter!=="All"?` in ${expFilter}`:""}</div>
            ):(
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:12.5}}>
                <thead><tr style={{borderBottom:"0.5px solid rgba(255,255,255,0.07)"}}>
                  {["Date","Category","Description","PKR","Notes",...(role==="ceo"?["Added By"]:[]),""].map(h=>(
                    <th key={h} style={{textAlign:"left",padding:"10px 12px",fontSize:10,fontWeight:500,color:"rgba(255,255,255,0.28)",textTransform:"uppercase",letterSpacing:"0.07em"}}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {filteredExp.map(e=>{
                    const cc=CAT_COLORS[e.category]||"#94a3b8";
                    if (editExpId===e.id) return (
                      <tr key={e.id} style={{borderBottom:"0.5px solid rgba(99,102,241,0.15)",background:"rgba(99,102,241,0.05)"}}>
                        <td style={{padding:"8px 12px"}}><input type="date" value={editExp.date||""} onChange={ev=>setEditExp({...editExp,date:ev.target.value})} style={{...inp,padding:"5px 8px",fontSize:12}}/></td>
                        <td style={{padding:"8px 12px"}}>
                          <select value={editExp.category||""} onChange={ev=>setEditExp({...editExp,category:ev.target.value})} style={{...sel,padding:"5px 8px",fontSize:12}}>
                            {EXP_CATS.slice(1).map(c=><option key={c}>{c}</option>)}
                          </select>
                        </td>
                        <td style={{padding:"8px 12px"}}><input value={editExp.description||""} onChange={ev=>setEditExp({...editExp,description:ev.target.value})} style={{...inp,padding:"5px 8px",fontSize:12}}/></td>
                        <td style={{padding:"8px 12px"}}><input type="number" value={editExp.amount_pkr||""} onChange={ev=>setEditExp({...editExp,amount_pkr:ev.target.value})} style={{...inp,padding:"5px 8px",fontSize:12,width:110}}/></td>
                        <td style={{padding:"8px 12px"}}><input value={editExp.notes||""} onChange={ev=>setEditExp({...editExp,notes:ev.target.value})} style={{...inp,padding:"5px 8px",fontSize:12}}/></td>
                        {role==="ceo"&&<td style={{padding:"8px 12px",color:"rgba(255,255,255,0.3)",fontSize:11}}>{editExp.created_by||"—"}</td>}
                        <td style={{padding:"8px 12px"}}>
                          <div style={{display:"flex",gap:5}}>
                            <button onClick={()=>updateExpense(e.id)} style={{background:"rgba(34,197,94,0.15)",color:"#86efac",border:"none",borderRadius:6,padding:"4px 10px",fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>Save</button>
                            <button onClick={()=>setEditExpId(null)} style={{background:"rgba(255,255,255,0.06)",color:"rgba(255,255,255,0.5)",border:"none",borderRadius:6,padding:"4px 10px",fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>✕</button>
                          </div>
                        </td>
                      </tr>
                    );
                    return (
                      <tr key={e.id} style={{borderBottom:"0.5px solid rgba(255,255,255,0.04)"}}>
                        <td style={{padding:"10px 12px",color:"rgba(255,255,255,0.5)",fontSize:11.5}}>{e.date?new Date(e.date).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}):"—"}</td>
                        <td style={{padding:"10px 12px"}}><span style={{fontSize:10.5,padding:"2px 8px",borderRadius:5,background:`${cc}18`,color:cc,fontWeight:500}}>{e.category}</span></td>
                        <td style={{padding:"10px 12px",color:"#fff",fontWeight:500}}>{e.description}</td>
                        <td style={{padding:"10px 12px",color:"#86efac",fontWeight:600}}>{parseFloat(e.amount_pkr||0)>0?`₨${Math.round(parseFloat(e.amount_pkr)).toLocaleString()}`:"—"}</td>
                        <td style={{padding:"10px 12px",color:"rgba(255,255,255,0.35)",fontSize:11.5}}>{e.notes||"—"}</td>
                        {role==="ceo"&&<td style={{padding:"10px 12px",color:"#a5b4fc",fontSize:11.5}}>{e.created_by||"—"}</td>}
                        <td style={{padding:"10px 12px"}}>
                          <div style={{display:"flex",gap:5}}>
                            <button onClick={()=>{setEditExpId(e.id);setEditExp({...e});setShowAddExp(false);}} style={{background:"rgba(99,102,241,0.12)",color:"#a5b4fc",border:"none",borderRadius:6,padding:"4px 10px",fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>Edit</button>
                            <button onClick={()=>deleteExpense(e.id)} style={{background:"rgba(239,68,68,0.1)",color:"#f87171",border:"none",borderRadius:6,padding:"4px 10px",fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>Del</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ── DONATIONS TAB ── */}
      {financeTab==="donations"&&(
        <div>
          {/* Summary */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:20}}>
            <div style={{background:"rgba(99,102,241,0.1)",border:"0.5px solid rgba(99,102,241,0.2)",borderRadius:12,padding:16}}>
              <div style={{fontSize:10,color:"rgba(255,255,255,0.35)",textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:4}}>Monthly Total (PKR)</div>
              <div style={{fontSize:22,fontWeight:700,color:"#a5b4fc"}}>₨{donTotalPKR.toLocaleString()}</div>
            </div>
            <div style={{background:"rgba(34,197,94,0.08)",border:"0.5px solid rgba(34,197,94,0.2)",borderRadius:12,padding:16}}>
              <div style={{fontSize:10,color:"rgba(255,255,255,0.35)",textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:4}}>Active Recipients</div>
              <div style={{fontSize:22,fontWeight:700,color:"#86efac"}}>{donActive.length}</div>
            </div>
            <div style={{background:"rgba(245,158,11,0.08)",border:"0.5px solid rgba(245,158,11,0.2)",borderRadius:12,padding:16}}>
              <div style={{fontSize:10,color:"rgba(255,255,255,0.35)",textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:4}}>Total Recipients</div>
              <div style={{fontSize:22,fontWeight:700,color:"#fcd34d"}}>{donations.length}</div>
            </div>
          </div>

          {/* Add button */}
          <div style={{display:"flex",justifyContent:"flex-end",marginBottom:14}}>
            <button onClick={()=>{setShowAddDon(v=>!v);setEditDonId(null);}} style={{background:"rgba(99,102,241,0.15)",border:"0.5px solid rgba(99,102,241,0.35)",borderRadius:8,padding:"6px 14px",color:"#a5b4fc",fontSize:12,cursor:"pointer",fontFamily:"inherit",fontWeight:500}}>
              {showAddDon?"✕ Cancel":"＋ Add Recipient"}
            </button>
          </div>

          {/* Add Donation Form */}
          {showAddDon&&(
            <div style={{background:"#13151f",border:"0.5px solid rgba(99,102,241,0.25)",borderRadius:12,padding:16,marginBottom:14}}>
              <div style={{fontSize:12,fontWeight:500,marginBottom:12,color:"#a5b4fc"}}>New Donation Recipient</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:10}}>
                {[["Name *","name","text"],["Address","address","text"],["Bank Name","bankName","text"],["Account No","accountNo","text"],["Account Title","accountTitle","text"],["Monthly Amount","monthlyAmount","number"]].map(([lbl,fld,type])=>(
                  <div key={fld}><div style={{fontSize:10,color:"rgba(255,255,255,0.35)",marginBottom:3}}>{lbl}</div>
                    <input type={type} placeholder={lbl} value={newDon[fld]} onChange={e=>setNewDon({...newDon,[fld]:e.target.value})} style={inp}/>
                  </div>
                ))}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr auto",gap:8,alignItems:"flex-end"}}>
                <div><div style={{fontSize:10,color:"rgba(255,255,255,0.35)",marginBottom:3}}>Currency</div>
                  <select value={newDon.currency} onChange={e=>setNewDon({...newDon,currency:e.target.value})} style={sel}><option>PKR</option><option>GBP</option></select>
                </div>
                <div><div style={{fontSize:10,color:"rgba(255,255,255,0.35)",marginBottom:3}}>Payment Method</div>
                  <select value={newDon.paymentMethod} onChange={e=>setNewDon({...newDon,paymentMethod:e.target.value})} style={sel}><option>Bank Transfer</option><option>Cash</option><option>JazzCash</option><option>Easypaisa</option></select>
                </div>
                <div><div style={{fontSize:10,color:"rgba(255,255,255,0.35)",marginBottom:3}}>Status</div>
                  <select value={newDon.status} onChange={e=>setNewDon({...newDon,status:e.target.value})} style={sel}><option>Active</option><option>Paused</option><option>Stopped</option></select>
                </div>
                <button onClick={saveDonation} style={{background:"#6366f1",border:"none",borderRadius:8,padding:"9px 20px",color:"#fff",fontSize:12.5,fontWeight:500,cursor:"pointer",fontFamily:"inherit"}}>Save</button>
              </div>
            </div>
          )}

          {/* Donations List */}
          {donations.length===0?(
            <div style={{background:"#13151f",border:"0.5px solid rgba(255,255,255,0.07)",borderRadius:12,padding:48,textAlign:"center",color:"rgba(255,255,255,0.25)",fontSize:13}}>No donation recipients added</div>
          ):(
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {donations.map(d=>{
                const statusColor=d.status==="Active"?"#86efac":d.status==="Paused"?"#fcd34d":"#f87171";
                const statusBg=d.status==="Active"?"rgba(34,197,94,0.1)":d.status==="Paused"?"rgba(245,158,11,0.1)":"rgba(239,68,68,0.1)";
                if (editDonId===d.id) return (
                  <div key={d.id} style={{background:"#13151f",border:"0.5px solid rgba(99,102,241,0.3)",borderRadius:12,padding:16}}>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:10}}>
                      {[["Name *","name","name"],["Address","address","address"],["Bank Name","bank_name","bankName"],["Account No","account_no","accountNo"],["Account Title","account_title","accountTitle"],["Monthly Amount","monthly_amount","monthlyAmount"]].map(([lbl,fld])=>(
                        <div key={fld}><div style={{fontSize:10,color:"rgba(255,255,255,0.35)",marginBottom:3}}>{lbl}</div>
                          <input type={fld==="monthly_amount"?"number":"text"} value={editDon[fld]||""} onChange={ev=>setEditDon({...editDon,[fld]:ev.target.value})} style={inp}/>
                        </div>
                      ))}
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr auto auto",gap:8,alignItems:"flex-end"}}>
                      <div><div style={{fontSize:10,color:"rgba(255,255,255,0.35)",marginBottom:3}}>Currency</div>
                        <select value={editDon.currency||"PKR"} onChange={ev=>setEditDon({...editDon,currency:ev.target.value})} style={sel}><option>PKR</option><option>GBP</option></select>
                      </div>
                      <div><div style={{fontSize:10,color:"rgba(255,255,255,0.35)",marginBottom:3}}>Payment Method</div>
                        <select value={editDon.payment_method||"Bank Transfer"} onChange={ev=>setEditDon({...editDon,payment_method:ev.target.value})} style={sel}><option>Bank Transfer</option><option>Cash</option><option>JazzCash</option><option>Easypaisa</option></select>
                      </div>
                      <div><div style={{fontSize:10,color:"rgba(255,255,255,0.35)",marginBottom:3}}>Status</div>
                        <select value={editDon.status||"Active"} onChange={ev=>setEditDon({...editDon,status:ev.target.value})} style={sel}><option>Active</option><option>Paused</option><option>Stopped</option></select>
                      </div>
                      <button onClick={()=>updateDonation(d.id)} style={{background:"rgba(34,197,94,0.15)",color:"#86efac",border:"none",borderRadius:7,padding:"8px 14px",fontSize:12,cursor:"pointer",fontFamily:"inherit",fontWeight:500}}>Save</button>
                      <button onClick={()=>setEditDonId(null)} style={{background:"rgba(255,255,255,0.06)",color:"rgba(255,255,255,0.4)",border:"none",borderRadius:7,padding:"8px 12px",fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>✕</button>
                    </div>
                  </div>
                );
                return (
                  <div key={d.id} style={{background:"#13151f",border:"0.5px solid rgba(255,255,255,0.07)",borderRadius:12,padding:"14px 16px",display:"flex",alignItems:"center",gap:12}}>
                    <div style={{width:40,height:40,borderRadius:10,background:"linear-gradient(135deg,#6366f1,#8b5cf6)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:700,color:"#fff",flexShrink:0}}>{d.name[0].toUpperCase()}</div>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:2}}>
                        <span style={{fontSize:13,fontWeight:600,color:"#fff"}}>{d.name}</span>
                        <span style={{fontSize:10,padding:"2px 8px",borderRadius:5,background:statusBg,color:statusColor,fontWeight:500}}>{d.status}</span>
                      </div>
                      <div style={{fontSize:11,color:"rgba(255,255,255,0.4)"}}>
                        {d.bank_name?`${d.bank_name} · ${d.account_no||""}${d.account_title?` · ${d.account_title}`:""}`:"No bank details"}
                        {d.address?` · ${d.address}`:""}
                      </div>
                      {d.payment_method&&<div style={{fontSize:10.5,color:"rgba(255,255,255,0.28)",marginTop:2}}>{d.payment_method}</div>}
                    </div>
                    <div style={{textAlign:"right",minWidth:90}}>
                      <div style={{fontSize:11,fontWeight:700,color:d.status==="Active"?"#a5b4fc":"rgba(255,255,255,0.3)"}}>
                        {d.currency==="GBP"?"£":"₨"}{parseFloat(d.monthly_amount||0).toLocaleString()}
                      </div>
                      <div style={{fontSize:9.5,color:"rgba(255,255,255,0.28)",marginTop:1}}>per month</div>
                    </div>
                    <div style={{display:"flex",gap:5,flexShrink:0}}>
                      <button onClick={()=>{setEditDonId(d.id);setEditDon({...d});setShowAddDon(false);}} style={{background:"rgba(99,102,241,0.12)",color:"#a5b4fc",border:"none",borderRadius:6,padding:"5px 11px",fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>Edit</button>
                      <button onClick={()=>deleteDonation(d.id)} style={{background:"rgba(239,68,68,0.1)",color:"#f87171",border:"none",borderRadius:6,padding:"5px 11px",fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>Del</button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );

  // ── HISTORY PANEL ──
  const HistoryPanel = (
    <div style={{flex:1,overflowY:"auto",padding:"24px 26px"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
        <div>
          <div style={{fontSize:18,fontWeight:600}}>Activity History</div>
          <div style={{fontSize:12,color:"rgba(255,255,255,0.4)",marginTop:3}}>Last 30 days — who saved which entry and when</div>
        </div>
        <button onClick={fetchActivityLog} style={{background:"rgba(99,102,241,0.12)",border:"0.5px solid rgba(99,102,241,0.25)",color:"#a5b4fc",borderRadius:8,padding:"7px 16px",fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>↻ Refresh</button>
      </div>
      {activityLog.length===0?(
        <div style={{textAlign:"center",padding:60,color:"rgba(255,255,255,0.25)",fontSize:13}}>No activity in the last 30 days</div>
      ):(
        <div style={{background:"#13151f",border:"0.5px solid rgba(255,255,255,0.06)",borderRadius:12,overflow:"hidden"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead>
              <tr style={{borderBottom:"0.5px solid rgba(255,255,255,0.07)"}}>
                {["Date & Time","VA Name","Store","Dept","Month","Saved By"].map(h=>(
                  <th key={h} style={{padding:"11px 14px",textAlign:"left",fontSize:10.5,color:"rgba(255,255,255,0.3)",fontWeight:500,textTransform:"uppercase",letterSpacing:"0.07em"}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activityLog.map((row,i)=>{
                const dt=new Date(row.saved_at);
                const dateStr=dt.toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"});
                const timeStr=dt.toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit",hour12:true});
                const parts=(row.month_key||"").split("-");
                const monthLabel=parts.length===2?`${MONTHS[parseInt(parts[1])-1]||""} ${parts[0]}`:(row.month_key||"—");
                const dc=DEPT_COLORS[row.dept]||"#6366f1";
                return (
                  <tr key={row.id} style={{borderBottom:"0.5px solid rgba(255,255,255,0.04)",background:i%2===0?"transparent":"rgba(255,255,255,0.01)"}}>
                    <td style={{padding:"10px 14px"}}>
                      <div style={{fontSize:12.5,color:"#e2e8f0",fontWeight:500}}>{dateStr}</div>
                      <div style={{fontSize:11,color:"rgba(255,255,255,0.35)",marginTop:2}}>{timeStr}</div>
                    </td>
                    <td style={{padding:"10px 14px",fontSize:13,color:"#fff",fontWeight:500}}>{row.va_name||"—"}</td>
                    <td style={{padding:"10px 14px",fontSize:12.5,color:"rgba(255,255,255,0.65)"}}>{row.store_name||"—"}</td>
                    <td style={{padding:"10px 14px"}}>
                      <span style={{fontSize:10,padding:"3px 9px",borderRadius:5,background:`${dc}20`,color:dc,fontWeight:600}}>{row.dept||"—"}</span>
                    </td>
                    <td style={{padding:"10px 14px",fontSize:12,color:"rgba(255,255,255,0.5)"}}>{monthLabel}</td>
                    <td style={{padding:"10px 14px"}}>
                      <div style={{display:"inline-flex",alignItems:"center",gap:6,background:"rgba(165,180,252,0.08)",border:"0.5px solid rgba(165,180,252,0.2)",borderRadius:6,padding:"3px 10px"}}>
                        <div style={{width:6,height:6,borderRadius:"50%",background:"#a5b4fc"}}></div>
                        <span style={{fontSize:12,color:"#a5b4fc",fontWeight:500}}>{row.saved_by||"—"}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  // ── CHAT PANEL (CEO/Admin) ──
  const ChatPanel = (
    <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
      <div style={{padding:"14px 26px 12px",borderBottom:"0.5px solid rgba(255,255,255,0.06)",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{fontSize:15,fontWeight:600}}>💬 Team Chat</div>
        <button onClick={fetchChat} style={{background:"rgba(255,255,255,0.06)",border:"0.5px solid rgba(255,255,255,0.1)",color:"rgba(255,255,255,0.5)",borderRadius:7,padding:"6px 14px",fontSize:11.5,cursor:"pointer",fontFamily:"inherit"}}>↻ Refresh</button>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"16px 26px",display:"flex",flexDirection:"column",gap:10}}>
        {chatMessages.length===0&&<div style={{textAlign:"center",color:"rgba(255,255,255,0.2)",fontSize:13,marginTop:60}}>No messages yet. Be the first to say something!</div>}
        {chatMessages.map((msg,i)=>{
          const isMe=msg.from_username===currentUser;
          const rc=msg.from_role==="ceo"?"#6366f1":msg.from_role==="admin"?"#22c55e":"#f97316";
          return (
            <div key={msg.id||i} style={{display:"flex",flexDirection:"column",alignItems:isMe?"flex-end":"flex-start"}}>
              <div style={{fontSize:10,color:"rgba(255,255,255,0.3)",marginBottom:3,display:"flex",gap:6,alignItems:"center"}}>
                <span>{isMe?"You":msg.from_name}</span>
                {!isMe&&<span style={{color:rc,fontSize:9,textTransform:"uppercase",fontWeight:600,background:`${rc}18`,padding:"1px 6px",borderRadius:4}}>{msg.from_role}</span>}
                <span>· {new Date(msg.created_at).toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"})}</span>
              </div>
              <div style={{background:isMe?"rgba(99,102,241,0.18)":"rgba(255,255,255,0.06)",border:`0.5px solid ${isMe?"rgba(99,102,241,0.3)":"rgba(255,255,255,0.08)"}`,borderRadius:12,padding:"10px 14px",maxWidth:"65%",fontSize:13,lineHeight:"1.55",color:isMe?"#c7d2fe":"#fff",wordBreak:"break-word"}}>{msg.message}</div>
            </div>
          );
        })}
        <div ref={chatEndRef}/>
      </div>
      <div style={{padding:"14px 26px",borderTop:"0.5px solid rgba(255,255,255,0.07)",display:"flex",gap:8,flexShrink:0}}>
        <input value={chatInput} onChange={e=>setChatInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendChat()} placeholder="Type a message to the team..." style={{flex:1,background:"rgba(255,255,255,0.07)",border:"0.5px solid rgba(255,255,255,0.15)",borderRadius:9,padding:"10px 14px",color:"#fff",fontSize:13,outline:"none",fontFamily:"inherit"}}/>
        <button onClick={sendChat} style={{background:"#6366f1",border:"none",borderRadius:9,padding:"10px 24px",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Send</button>
      </div>
    </div>
  );

  // ── TASKS PANEL (CEO/Admin) ──
  const filtTasks = tasks.filter(t=>taskFilter==="All"||t.assigned_to_dept===taskFilter);
  const tStats = {total:filtTasks.length,pending:filtTasks.filter(t=>effSt(t)==="Pending").length,inProgress:filtTasks.filter(t=>effSt(t)==="In Progress").length,completed:filtTasks.filter(t=>effSt(t)==="Completed").length,overdue:filtTasks.filter(t=>effSt(t)==="Overdue").length};
  const TasksPanel = (
    <div style={{flex:1,overflowY:"auto",padding:"16px 26px"}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16}}>
        <div style={{display:"flex",gap:6}}>
          {["All","OnBuy","eBay","Amazon","TikTok Shop"].map(d=>(
            <button key={d} onClick={()=>setTaskFilter(d)} style={{padding:"5px 14px",fontSize:11.5,cursor:"pointer",borderRadius:7,border:`1px solid ${taskFilter===d?(DEPT_COLORS[d]||"#6366f1"):"rgba(255,255,255,0.1)"}`,background:taskFilter===d?`${(DEPT_COLORS[d]||"#6366f1")}20`:"transparent",color:taskFilter===d?(DEPT_COLORS[d]||"#6366f1"):"rgba(255,255,255,0.4)",fontFamily:"inherit",fontWeight:taskFilter===d?600:400,transition:"all 0.12s"}}>{d}</button>
          ))}
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>fetchTasks("All")} style={{background:"rgba(255,255,255,0.06)",border:"0.5px solid rgba(255,255,255,0.1)",color:"rgba(255,255,255,0.5)",borderRadius:7,padding:"7px 14px",fontSize:11.5,cursor:"pointer",fontFamily:"inherit"}}>↻ Refresh</button>
          <button onClick={()=>{setShowAddTask(!showAddTask);setEditTaskId(null);}} style={{background:"#6366f1",border:"none",borderRadius:8,padding:"8px 18px",color:"#fff",fontSize:12.5,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>+ New Task</button>
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,marginBottom:18}}>
        {[["Total",tStats.total,"#6366f1"],["Pending",tStats.pending,"#6366f1"],["In Progress",tStats.inProgress,"#0ea5e9"],["Completed",tStats.completed,"#22c55e"],["Overdue",tStats.overdue,"#ef4444"]].map(([lbl,val,c])=>(
          <div key={lbl} style={{background:"#13151f",border:`0.5px solid ${c}30`,borderRadius:10,padding:"12px 14px"}}>
            <div style={{fontSize:10,color:"rgba(255,255,255,0.35)",textTransform:"uppercase",letterSpacing:"0.07em"}}>{lbl}</div>
            <div style={{fontSize:22,fontWeight:700,color:c,marginTop:4}}>{val}</div>
          </div>
        ))}
      </div>
      {showAddTask&&(
        <div style={{background:"#13151f",border:"0.5px solid rgba(99,102,241,0.3)",borderRadius:12,padding:20,marginBottom:16}}>
          <div style={{fontSize:13,fontWeight:600,color:"#a5b4fc",marginBottom:14}}>New Task</div>
          <div style={{display:"grid",gridTemplateColumns:"1.5fr 1fr 1fr 1fr 1fr",gap:10,marginBottom:10}}>
            <div><div style={{fontSize:10.5,color:"rgba(255,255,255,0.4)",marginBottom:4}}>Title *</div><input value={newTask.title} onChange={e=>setNewTask(p=>({...p,title:e.target.value}))} placeholder="Task title..." style={{width:"100%",background:"rgba(255,255,255,0.07)",border:"0.5px solid rgba(255,255,255,0.15)",borderRadius:8,padding:"9px 12px",color:"#fff",fontSize:13,outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}/></div>
            <div><div style={{fontSize:10.5,color:"rgba(255,255,255,0.4)",marginBottom:4}}>Department</div><select value={newTask.assigned_to_dept} onChange={e=>setNewTask(p=>({...p,assigned_to_dept:e.target.value,assigned_to_manager:""}))} style={{width:"100%",background:"#1a1d2e",border:"0.5px solid rgba(255,255,255,0.15)",borderRadius:8,padding:"9px 12px",color:"#fff",fontSize:13,fontFamily:"inherit",outline:"none"}}>{["OnBuy","eBay","Amazon","TikTok Shop"].map(d=><option key={d} value={d}>{d}</option>)}</select></div>
            <div><div style={{fontSize:10.5,color:"rgba(255,255,255,0.4)",marginBottom:4}}>Assign To</div><select value={newTask.assigned_to_manager} onChange={e=>setNewTask(p=>({...p,assigned_to_manager:e.target.value}))} style={{width:"100%",background:"#1a1d2e",border:"0.5px solid rgba(255,255,255,0.15)",borderRadius:8,padding:"9px 12px",color:"#fff",fontSize:13,fontFamily:"inherit",outline:"none"}}><option value="">All Managers</option>{managers.filter(m=>m.department===newTask.assigned_to_dept).map(m=><option key={m.id} value={m.username}>{m.name}</option>)}</select></div>
            <div><div style={{fontSize:10.5,color:"rgba(255,255,255,0.4)",marginBottom:4}}>Priority</div><select value={newTask.priority} onChange={e=>setNewTask(p=>({...p,priority:e.target.value}))} style={{width:"100%",background:"#1a1d2e",border:"0.5px solid rgba(255,255,255,0.15)",borderRadius:8,padding:"9px 12px",color:"#fff",fontSize:13,fontFamily:"inherit",outline:"none"}}>{["Low","Medium","High","Urgent"].map(p=><option key={p} value={p}>{p}</option>)}</select></div>
            <div><div style={{fontSize:10.5,color:"rgba(255,255,255,0.4)",marginBottom:4}}>Due Date</div><input type="date" value={newTask.due_date} onChange={e=>setNewTask(p=>({...p,due_date:e.target.value}))} style={{width:"100%",background:"rgba(255,255,255,0.07)",border:"0.5px solid rgba(255,255,255,0.15)",borderRadius:8,padding:"9px 12px",color:"#fff",fontSize:13,outline:"none",fontFamily:"inherit",boxSizing:"border-box",colorScheme:"dark"}}/></div>
          </div>
          <div style={{marginBottom:10}}><div style={{fontSize:10.5,color:"rgba(255,255,255,0.4)",marginBottom:4}}>Description</div><textarea value={newTask.description} onChange={e=>setNewTask(p=>({...p,description:e.target.value}))} placeholder="Task description..." rows={2} style={{width:"100%",background:"rgba(255,255,255,0.07)",border:"0.5px solid rgba(255,255,255,0.15)",borderRadius:8,padding:"9px 12px",color:"#fff",fontSize:13,outline:"none",fontFamily:"inherit",boxSizing:"border-box",resize:"vertical"}}/></div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={async()=>{if(!newTask.title.trim())return alert("Title required!");try{const r=await fetch(`${API}/api/tasks`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({...newTask,assigned_by:currentUser})});const d=await r.json();if(d.id){setTasks(p=>[d,...p]);setNewTask({title:"",description:"",priority:"Medium",due_date:"",assigned_to_dept:newTask.assigned_to_dept,assigned_to_manager:"",notes:""});setShowAddTask(false);}}catch(e){}}} style={{background:"#6366f1",border:"none",borderRadius:8,padding:"9px 20px",color:"#fff",fontSize:12.5,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Create Task</button>
            <button onClick={()=>setShowAddTask(false)} style={{background:"rgba(255,255,255,0.06)",border:"none",borderRadius:8,padding:"9px 16px",color:"rgba(255,255,255,0.5)",fontSize:12.5,cursor:"pointer",fontFamily:"inherit"}}>Cancel</button>
          </div>
        </div>
      )}
      <div style={{background:"#13151f",border:"0.5px solid rgba(255,255,255,0.07)",borderRadius:12,overflow:"hidden"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
          <thead>
            <tr style={{borderBottom:"0.5px solid rgba(255,255,255,0.07)"}}>
              {["Title","Department","Assigned To","Priority","Status","Due Date","Assigned By","Actions"].map(h=>(
                <th key={h} style={{padding:"11px 14px",textAlign:"left",fontSize:10.5,color:"rgba(255,255,255,0.3)",fontWeight:500,textTransform:"uppercase",letterSpacing:"0.07em"}}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtTasks.length===0&&<tr><td colSpan={7} style={{padding:"32px",textAlign:"center",color:"rgba(255,255,255,0.2)",fontSize:13}}>No tasks found. Create one above.</td></tr>}
            {filtTasks.map((t,i)=>{
              const st=effSt(t);const sc=STAT_C[st]||"#6366f1";const pc=PRTY_C[t.priority]||"#f59e0b";const dc=DEPT_COLORS[t.assigned_to_dept]||"#6366f1";const isEd=editTaskId===t.id;
              return (
                <tr key={t.id} style={{borderBottom:"0.5px solid rgba(255,255,255,0.04)",background:i%2===0?"transparent":"rgba(255,255,255,0.01)"}}>
                  {isEd?(
                    <td colSpan={8} style={{padding:"14px 16px",background:"rgba(99,102,241,0.04)"}}>
                      <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr 1fr 1fr 1fr",gap:8,marginBottom:8}}>
                        <input value={editTask.title||""} onChange={e=>setEditTask(p=>({...p,title:e.target.value}))} style={{background:"rgba(255,255,255,0.07)",border:"0.5px solid rgba(255,255,255,0.15)",borderRadius:7,padding:"7px 10px",color:"#fff",fontSize:12.5,outline:"none",fontFamily:"inherit"}}/>
                        <select value={editTask.assigned_to_dept||"OnBuy"} onChange={e=>setEditTask(p=>({...p,assigned_to_dept:e.target.value,assigned_to_manager:""}))} style={{background:"#1a1d2e",border:"0.5px solid rgba(255,255,255,0.15)",borderRadius:7,padding:"7px 10px",color:"#fff",fontSize:12,fontFamily:"inherit",outline:"none"}}>{["OnBuy","eBay","Amazon","TikTok Shop"].map(d=><option key={d} value={d}>{d}</option>)}</select>
                        <select value={editTask.assigned_to_manager||""} onChange={e=>setEditTask(p=>({...p,assigned_to_manager:e.target.value}))} style={{background:"#1a1d2e",border:"0.5px solid rgba(255,255,255,0.15)",borderRadius:7,padding:"7px 10px",color:"#fff",fontSize:12,fontFamily:"inherit",outline:"none"}}><option value="">All Managers</option>{managers.filter(m=>m.department===(editTask.assigned_to_dept||"OnBuy")).map(m=><option key={m.id} value={m.username}>{m.name}</option>)}</select>
                        <select value={editTask.priority||"Medium"} onChange={e=>setEditTask(p=>({...p,priority:e.target.value}))} style={{background:"#1a1d2e",border:"0.5px solid rgba(255,255,255,0.15)",borderRadius:7,padding:"7px 10px",color:"#fff",fontSize:12,fontFamily:"inherit",outline:"none"}}>{["Low","Medium","High","Urgent"].map(p=><option key={p} value={p}>{p}</option>)}</select>
                        <select value={editTask.status||"Pending"} onChange={e=>setEditTask(p=>({...p,status:e.target.value}))} style={{background:"#1a1d2e",border:"0.5px solid rgba(255,255,255,0.15)",borderRadius:7,padding:"7px 10px",color:"#fff",fontSize:12,fontFamily:"inherit",outline:"none"}}>{["Pending","In Progress","Completed"].map(s=><option key={s} value={s}>{s}</option>)}</select>
                        <input type="date" value={editTask.due_date||""} onChange={e=>setEditTask(p=>({...p,due_date:e.target.value}))} style={{background:"rgba(255,255,255,0.07)",border:"0.5px solid rgba(255,255,255,0.15)",borderRadius:7,padding:"7px 10px",color:"#fff",fontSize:12,outline:"none",fontFamily:"inherit",colorScheme:"dark"}}/>
                      </div>
                      <textarea value={editTask.description||""} onChange={e=>setEditTask(p=>({...p,description:e.target.value}))} placeholder="Description..." rows={2} style={{width:"100%",background:"rgba(255,255,255,0.07)",border:"0.5px solid rgba(255,255,255,0.15)",borderRadius:7,padding:"7px 10px",color:"#fff",fontSize:12,outline:"none",fontFamily:"inherit",boxSizing:"border-box",resize:"vertical",marginBottom:8}}/>
                      <div style={{display:"flex",gap:8}}>
                        <button onClick={async()=>{try{const ca=editTask.status==="Completed"&&t.status!=="Completed"?new Date().toISOString():t.completed_at||null;await fetch(`${API}/api/tasks/${t.id}`,{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({...editTask,completed_at:ca})});setTasks(p=>p.map(x=>x.id===t.id?{...x,...editTask,completed_at:ca}:x));setEditTaskId(null);}catch(e){}}} style={{background:"rgba(34,197,94,0.15)",color:"#86efac",border:"none",borderRadius:7,padding:"6px 16px",fontSize:12,cursor:"pointer",fontFamily:"inherit",fontWeight:500}}>Save ✓</button>
                        <button onClick={()=>setEditTaskId(null)} style={{background:"rgba(255,255,255,0.06)",color:"rgba(255,255,255,0.5)",border:"none",borderRadius:7,padding:"6px 14px",fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>Cancel</button>
                      </div>
                    </td>
                  ):(
                    <>
                      <td style={{padding:"11px 14px"}}><div style={{fontSize:13,fontWeight:500}}>{t.title}</div>{t.description&&<div style={{fontSize:11,color:"rgba(255,255,255,0.35)",marginTop:2,maxWidth:240,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{t.description}</div>}</td>
                      <td style={{padding:"11px 14px"}}><span style={{fontSize:10.5,padding:"3px 9px",borderRadius:5,background:`${dc}20`,color:dc,fontWeight:600}}>{t.assigned_to_dept}</span></td>
                      <td style={{padding:"11px 14px",fontSize:12,color:"rgba(255,255,255,0.5)"}}>{t.assigned_to_manager?managers.find(m=>m.username===t.assigned_to_manager)?.name||t.assigned_to_manager:<span style={{color:"rgba(255,255,255,0.2)"}}>All</span>}</td>
                      <td style={{padding:"11px 14px"}}><span style={{fontSize:10.5,padding:"3px 9px",borderRadius:5,background:`${pc}20`,color:pc,fontWeight:600}}>{t.priority}</span></td>
                      <td style={{padding:"11px 14px"}}><span style={{fontSize:10.5,padding:"3px 9px",borderRadius:5,background:`${sc}18`,color:sc,fontWeight:600}}>{st}</span></td>
                      <td style={{padding:"11px 14px",fontSize:12,color:st==="Overdue"?"#f87171":"rgba(255,255,255,0.5)"}}>{t.due_date?new Date(t.due_date+"T00:00:00").toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}):"—"}</td>
                      <td style={{padding:"11px 14px",fontSize:12,color:"rgba(255,255,255,0.4)"}}>{t.assigned_by||"—"}</td>
                      <td style={{padding:"11px 14px"}}>
                        <div style={{display:"flex",gap:6}}>
                          <button onClick={()=>{setEditTaskId(t.id);setEditTask({title:t.title,description:t.description||"",assigned_to_dept:t.assigned_to_dept,assigned_to_manager:t.assigned_to_manager||"",priority:t.priority,status:t.status,due_date:t.due_date?t.due_date.split("T")[0]:"",notes:t.notes||"",completed_at:t.completed_at});}} style={{background:"rgba(99,102,241,0.12)",color:"#a5b4fc",border:"none",borderRadius:6,padding:"5px 12px",fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>Edit</button>
                          <button onClick={async()=>{if(!confirm("Delete this task?"))return;try{await fetch(`${API}/api/tasks/${t.id}`,{method:"DELETE"});setTasks(p=>p.filter(x=>x.id!==t.id));}catch(e){}}} style={{background:"rgba(239,68,68,0.1)",color:"#f87171",border:"none",borderRadius:6,padding:"5px 12px",fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>Delete</button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div style={{display:"flex",height:"100vh",fontFamily:"Inter,system-ui,sans-serif",background:"#0a0b11",color:"#fff",overflow:"hidden"}}>
      {Sidebar}
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",background:"#0e1018"}}>
        {Topbar}
        {activeNav==="dashboard"&&Dashboard}

      {/* ── INVOICE PREVIEW MODAL ── */}
      {invoicePreview&&(
        <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.7)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div style={{background:"#13151f",border:"0.5px solid rgba(255,255,255,0.1)",borderRadius:16,width:"100%",maxWidth:600,maxHeight:"90vh",overflowY:"auto"}}>
            {/* Modal Header */}
            <div style={{padding:"20px 24px 16px",borderBottom:"0.5px solid rgba(255,255,255,0.07)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div>
                <div style={{fontSize:16,fontWeight:600,color:"#fff"}}>{invoicePreview.type==="client"?"📄 Client Invoice Preview":"📄 VA Salary Slip Preview"}</div>
                <div style={{fontSize:12,color:"rgba(255,255,255,0.4)",marginTop:3}}>{invoicePreview.client.name} · {MONTHS[parseInt(selMonth)-1]} {selYear}</div>
              </div>
              <button onClick={()=>setInvoicePreview(null)} style={{background:"rgba(255,255,255,0.06)",border:"none",color:"rgba(255,255,255,0.5)",borderRadius:8,padding:"6px 12px",fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>✕ Close</button>
            </div>

            {/* Invoice Content */}
            <div style={{padding:"20px 24px"}}>
              {/* Client/VA info */}
              <div style={{background:"rgba(99,102,241,0.08)",border:"0.5px solid rgba(99,102,241,0.2)",borderRadius:10,padding:14,marginBottom:16}}>
                <div style={{fontSize:11,color:"rgba(255,255,255,0.35)",marginBottom:4}}>RECIPIENT</div>
                <div style={{fontSize:14,fontWeight:500,color:"#fff"}}>{invoicePreview.type==="client"?invoicePreview.client.name:(invoicePreview.stores[0]?.vaName||invoicePreview.client.name)}</div>
                <div style={{fontSize:12,color:"rgba(255,255,255,0.4)",marginTop:2}}>{invoicePreview.client.email}</div>
                {invoicePreview.client.company&&<div style={{fontSize:12,color:"rgba(255,255,255,0.4)"}}>{invoicePreview.client.company}</div>}
              </div>

              {/* Stores table */}
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:12.5,marginBottom:16}}>
                <thead><tr style={{borderBottom:"0.5px solid rgba(255,255,255,0.08)"}}>
                  <th style={{textAlign:"left",padding:"8px 10px",fontSize:10.5,color:"rgba(255,255,255,0.3)",fontWeight:500,textTransform:"uppercase"}}>Store</th>
                  <th style={{textAlign:"right",padding:"8px 10px",fontSize:10.5,color:"rgba(255,255,255,0.3)",fontWeight:500,textTransform:"uppercase"}}>Profit</th>
                  {invoicePreview.type==="va"&&<th style={{textAlign:"right",padding:"8px 10px",fontSize:10.5,color:"rgba(255,255,255,0.3)",fontWeight:500,textTransform:"uppercase"}}>Penalties</th>}
                  <th style={{textAlign:"right",padding:"8px 10px",fontSize:10.5,color:"rgba(255,255,255,0.3)",fontWeight:500,textTransform:"uppercase"}}>{invoicePreview.type==="client"?"Client Share":"Salary"}</th>
                </tr></thead>
                <tbody>
                  {invoicePreview.stores.map((s,i)=>(
                    <tr key={i} style={{borderBottom:"0.5px solid rgba(255,255,255,0.04)"}}>
                      <td style={{padding:"9px 10px",color:"#fff"}}>{s.storeName}</td>
                      <td style={{padding:"9px 10px",textAlign:"right"}}>£{s.totalProfit.toFixed(2)}</td>
                      {invoicePreview.type==="va"&&<td style={{padding:"9px 10px",textAlign:"right",color:"#f87171"}}>£{s.penalties.toFixed(2)}</td>}
                      <td style={{padding:"9px 10px",textAlign:"right",color:"#86efac",fontWeight:600}}>£{(invoicePreview.type==="client"?s.clientShare:s.vaEarning).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div style={{background:"rgba(255,255,255,0.04)",borderRadius:10,padding:14,marginBottom:20}}>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  <div><div style={{fontSize:10,color:"rgba(255,255,255,0.35)"}}>Total Store Profit</div><div style={{fontSize:15,fontWeight:600}}>£{invoicePreview.totals.totalProfit.toFixed(2)}</div></div>
                  {invoicePreview.type==="client"&&<div><div style={{fontSize:10,color:"rgba(255,255,255,0.35)"}}>Agency Fee</div><div style={{fontSize:15,fontWeight:600,color:"#fcd34d"}}>£{invoicePreview.totals.totalAgency.toFixed(2)}</div></div>}
                  {invoicePreview.type==="va"&&<div><div style={{fontSize:10,color:"rgba(255,255,255,0.35)"}}>Total Penalties</div><div style={{fontSize:15,fontWeight:600,color:"#f87171"}}>£{invoicePreview.totals.totalPenalties.toFixed(2)}</div></div>}
                  <div style={{gridColumn:"1/-1",borderTop:"0.5px solid rgba(255,255,255,0.07)",paddingTop:8,marginTop:4}}>
                    <div style={{fontSize:10,color:"rgba(255,255,255,0.35)"}}>{invoicePreview.type==="client"?"Client Net Earnings":"VA Final Salary"}</div>
                    <div style={{fontSize:20,fontWeight:700,color:"#86efac"}}>£{(invoicePreview.type==="client"?invoicePreview.totals.totalClientShare:invoicePreview.totals.totalVAEarning).toFixed(2)}</div>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div style={{display:"flex",gap:10}}>
                <button onClick={()=>setInvoicePreview(null)} style={{flex:1,background:"rgba(245,158,11,0.12)",border:"0.5px solid rgba(245,158,11,0.3)",color:"#fcd34d",borderRadius:9,padding:"11px",fontSize:13,fontWeight:500,cursor:"pointer",fontFamily:"inherit"}}>
                  📋 Mark as Pending
                </button>
                <button onClick={sendInvoice} disabled={!!sendingInvoice} style={{flex:1,background:"#6366f1",border:"none",color:"#fff",borderRadius:9,padding:"11px",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>
                  {sendingInvoice?"Sending...":"📧 Send Now"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
        {activeNav==="monthly"&&MonthlySheet}
        {activeNav==="reports"&&Analytics}
        {activeNav==="clients"&&ClientsPanel}
        {activeNav==="employees"&&EmployeesPanel}
        {activeNav==="finance"&&FinancePanel}
        {activeNav==="tasks"&&TasksPanel}
        {activeNav==="chat"&&ChatPanel}
        {activeNav==="history"&&role==="ceo"&&HistoryPanel}
        {activeNav==="settings"&&SettingsPanel}
      </div>
    </div>
  );
}
