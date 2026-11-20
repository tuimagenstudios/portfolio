(() => {
  const toggle=document.getElementById('sound-toggle');
  if(!toggle)return;
  const status=document.getElementById('sound-status');
  const live=document.getElementById('live-notices');
  let context, active=false;
  const sample=document.createElement('button');
  sample.type='button';
  sample.textContent='Probar sonido';
  sample.className='sound-sample';
  toggle.after(sample);
  async function unlock(){
    const AudioEngine=window.AudioContext||window.webkitAudioContext;
    context ||= new AudioEngine();
    await context.resume();
    if(context.state!=='running')throw Error('Audio suspendido');
  }
  sample.onclick=async()=>{
    try{await unlock();playTone();status.textContent='Prueba de dos tonos. Si no los oís, revisá el volumen y el silencio de la pestaña.';}
    catch{status.textContent='El navegador no pudo reproducir la prueba.';}
  };
  function playTone(){

    const t=context.currentTime+.03;
    for(const [offset,hz] of [[0,620],[0.23,820]]){
      const note=context.createOscillator(),volume=context.createGain();
      note.frequency.value=hz;
      volume.gain.setValueAtTime(0.001,t+offset);
      volume.gain.exponentialRampToValueAtTime(.18,t+offset+.025);
      volume.gain.exponentialRampToValueAtTime(.001,t+offset+.32);
      note.connect(volume);volume.connect(context.destination);
      note.start(t+offset);note.stop(t+offset+.33);
    }
  }
  function bell(){
    if(!active)return;
    if(context.state==='running')playTone();
    else status.textContent='Nuevo aviso. Tocá Probar sonido para reactivar el audio.';
  }
  toggle.onclick=async()=>{
    try{
      if(!active){
        await unlock();
      }
      active=!active;
      toggle.setAttribute('aria-pressed',String(active));
      toggle.textContent=active?'Silenciar avisos':'Activar sonido de avisos';
      status.textContent=active?'Sonido activo en esta pestaña.':'Sonido desactivado.';
      if(active)bell();
    }catch{status.textContent='Tu navegador no pudo activar el sonido.';}
  };
  if(!live){
    window.addEventListener('storage',event=>{
      if(event.key==='energym.acceso.demo.Martina López'){render();return;}
      if(event.key!=='energym.avisos.demo.v1')return;
      render();
      const before=JSON.parse(event.oldValue||'[]'),after=JSON.parse(event.newValue||'[]');
      if(!toggle.hidden&&!document.getElementById('avisos').hidden&&after.some(n=>!before.some(old=>old.id===n.id)))bell();
    });
    return;
  }
  let latest=live.dataset.latest, previous=null;
  async function refresh(){
    try{
      const response=await fetch('/avisos-vivos',{cache:'no-store'});
      if(response.status===403){location.replace('/espacio.html');return;}
      if(!response.ok)return;
      const items=await response.json();
      const signature=JSON.stringify(items),head=items[0]?.stamp||'';
      if(signature===previous)return;
      const fresh=head&&head!==latest&&(previous===null?(!latest||items.some(n=>n.stamp===latest)):!JSON.parse(previous).some(n=>n.stamp===head));
      previous=signature;latest=head;
      live.replaceChildren();
      const unread=items.filter(n=>!n.seen).length;
      if(unread)live.append(unread+' sin leer');
      if(!items.length)status.textContent='';
      for(const item of items){
        const article=document.createElement('article'),message=document.createElement('p');
        message.textContent=item.body;article.append(message);
        if(!item.seen){
          const form=document.createElement('form'),input=document.createElement('input'),button=document.createElement('button');
          form.method='post';form.action='/accion/readNotice';input.type='hidden';input.name='notice';input.value=item.id;button.textContent='Marcar como leído';
          form.append(input,button);article.append(form);
        }
        live.append(article);
      }
      if(fresh){status.textContent='Nuevo aviso de Ramiro.';bell();}
    }catch{/* Reintentar al recuperar conexión. */}
  }
  async function poll(){await refresh();setTimeout(poll,8000);}
  poll();
})();


