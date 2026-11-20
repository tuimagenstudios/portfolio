const fichaIngreso = (() => {
  const groups = [
    ["Datos personales",[["birth","Fecha de nacimiento","date"],["phone","Teléfono / WhatsApp","tel"],["email","Correo de contacto","email"],["address","Domicilio y localidad"],["guardian","Responsable adulto, si corresponde"],["guardianPhone","Teléfono del responsable","tel"]]],
    ["En caso de emergencia",[["contact","A quién llamar"],["relation","Vínculo con el alumno"],["emergencyPhone","Teléfono principal","tel"],["backup","Contacto alternativo y teléfono"],["coverage","Cobertura médica / obra social"],["member","Número de afiliación"]]],
    ["Salud y cuidados para entrenar",[["conditions","Antecedentes de salud relevantes","memo"],["injuries","Lesiones, cirugías o rehabilitación","memo"],["allergies","Alergias y reacciones conocidas","memo"],["medication","Medicación relevante para el entrenamiento","memo"],["limits","Indicaciones profesionales y movimientos a evitar","memo"],["certificate","Estado del apto físico","choice"],["expiry","Vencimiento del apto, si corresponde","date"]]],
    ["Ingreso y objetivos",[["start","Fecha de ingreso","date"],["goals","Objetivos del alumno","memo"],["experience","Actividad previa y experiencia","memo"],["preferences","Disponibilidad y preferencias","memo"]]]
  ];
  const escape = value => String(value ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const options=["","Pendiente","Presentado","No corresponde"];
  function fields(data={}) {
    return groups.map(([group,items])=>'<fieldset class="intake-group"><legend>'+group+'</legend>'+items.map(([key,label,type])=>{
      const v=escape(data[key]);
      let control;
      if(type==="memo") control='<textarea maxlength="500" rows="2" name="'+key+'">'+v+'</textarea>';
      else if(type==="choice") control='<select name="'+key+'">'+options.map(o=>'<option value="'+o+'"'+(o===data[key]?' selected':'')+'>'+(o||'Sin informar')+'</option>').join('')+'</select>';
      else control='<input name="'+key+'" type="'+(type||'text')+'" maxlength="180" value="'+v+'">';
      return '<label>'+label+control+'</label>';
    }).join('')+'</fieldset>').join('');
  }
  function read(data){
    const result={};
    for(const [,items] of groups) for(const [key,,type] of items){
      const v=String(data.get(key)||'').trim();
      if(v.length>(type==='memo'?500:180)||(type==='choice'&&!options.includes(v))||(type==='date'&&v&&!/^\d{4}-\d\d-\d\d$/.test(v))) throw Object.assign(new Error('Revisá los datos de la ficha.'),{status:400});
      result[key]=v;
    }
    return result;
  }
  function summary(data={}){
    return groups.map(([group,items])=>'<details class="intake-summary"'+(group==="En caso de emergencia"?' open':'')+'><summary>'+group+'</summary><dl>'+items.filter(([k])=>data[k]).map(([k,label])=>'<dt>'+label+'</dt><dd>'+escape(data[k])+'</dd>').join('')+'</dl>'+(!items.some(([k])=>data[k])?'<p>Sin datos cargados.</p>':'')+'</details>').join('');
  }
  return {fields,read,summary};
})();
if(typeof module!=="undefined")module.exports=fichaIngreso;
