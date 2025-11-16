export const dynamic = "force-dynamic";
'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
export default function AdminPage(){
  const [user, setUser] = useState(null);
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({title:'', type:'RV', price:'', year:'', miles:'', description:''});
  const [file, setFile] = useState(null);
  useEffect(()=>{
    supabase.auth.getSession().then(({data})=> setUser(data.session?.user ?? null));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session)=> setUser(session?.user ?? null));
    fetchItems();
    return ()=> listener.subscription.unsubscribe();
  },[]);
  async function fetchItems(){
    const { data } = await supabase.from('inventory').select('*, images(*)').order('created_at',{ascending:false});
    setItems(data || []);
  }
  async function signIn(email){
    await supabase.auth.signInWithOtp({ email });
    alert('Check your email for a magic link.');
  }
  async function addItem(e){
    e.preventDefault();
    const { data } = await supabase.from('inventory').insert([{
      title: form.title, type: form.type, price: form.price, year: form.year, miles: form.miles, description: form.description
    }]).select().single();
    if(file){
      const fileExt = file.name.split('.').pop();
      const fileName = `${data.id}/${Date.now()}.${fileExt}`;
      await supabase.storage.from('inventory-images').upload(fileName, file);
      const { publicURL } = supabase.storage.from('inventory-images').getPublicUrl(fileName);
      await supabase.from('images').insert([{ inventory_id: data.id, url: publicURL }]);
    }
    setForm({title:'', type:'RV', price:'', year:'', miles:'', description:''});
    setFile(null);
    fetchItems();
  }
  async function deleteItem(id){
    if(!confirm('Delete this item?')) return;
    await supabase.from('inventory').delete().eq('id', id);
    fetchItems();
  }
  return (
    <div className="max-w-7xl mx-auto p-8">
      <h2 className="text-2xl font-bold">Admin Panel</h2>
      {!user && (<div className="mt-4">
        <p>Sign in with your admin email:</p>
        <input type="email" id="admin-email" className="border p-2" placeholder="you@yourcompany.com" />
        <button className="ml-2 p-2 bg-sky-600 text-white" onClick={()=>signIn(document.getElementById('admin-email').value)}>Send Magic Link</button>
      </div>)}
      {user && (<div className="mt-6">
        <p>Signed in as {user.email}</p>
        <form onSubmit={addItem} className="grid grid-cols-1 gap-2 mt-4">
          <input value={form.title} onChange={(e)=>setForm({...form, title:e.target.value})} placeholder="Title" className="border p-2"/>
          <select value={form.type} onChange={(e)=>setForm({...form, type:e.target.value})} className="border p-2">
            <option>RV</option><option>Truck</option><option>Trailer</option>
          </select>
          <input value={form.price} onChange={(e)=>setForm({...form, price:e.target.value})} placeholder="Price" className="border p-2"/>
          <input value={form.year} onChange={(e)=>setForm({...form, year:e.target.value})} placeholder="Year" className="border p-2"/>
          <input value={form.miles} onChange={(e)=>setForm({...form, miles:e.target.value})} placeholder="Miles" className="border p-2"/>
          <textarea value={form.description} onChange={(e)=>setForm({...form, description:e.target.value})} placeholder="Description" className="border p-2"/>
          <input type="file" onChange={(e)=>setFile(e.target.files[0])} />
          <div><button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">Add Item</button></div>
        </form>
        <div className="mt-6">
          <h3 className="font-semibold">Existing Items</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-3">
            {items.map(it=> (
              <div key={it.id} className="border p-3 rounded">
                <img src={it.images && it.images[0] ? it.images[0].url : '/logo.svg'} className="w-full h-32 object-cover rounded" />
                <div className="mt-2 font-semibold">{it.title}</div>
                <div className="text-sm">{it.year} • {it.miles}</div>
                <div className="mt-2 flex gap-2">
                  <button className="px-2 py-1 bg-red-600 text-white" onClick={()=>deleteItem(it.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>)}
    </div>
  );
}
