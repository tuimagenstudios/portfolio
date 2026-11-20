(()=> {
 const key="energym.presentacion.v3";
 if(localStorage.getItem(key))return;
 function date(days){const d=new Date();d.setDate(d.getDate()+days);return new Date(d-d.getTimezoneOffset()*60000).toISOString().slice(0,10);}
 const examples={
 "energym.planes.demo.v1":[{id:"dos",nombre:"Ejemplo · 2 clases por semana",precio:30000},{id:"tres",nombre:"Ejemplo · 3 clases por semana",precio:40000}],
 "energym.cuotas.demo.v1":[{pupil:"Martina López",paid:date(-5),due:date(25),amount:30000,concept:"Ejemplo · cuota mensual"}],
 "energym.avisos.demo.v1":[{id:"bienvenida",body:"Aviso de ejemplo: esta semana hay lugares en el turno de la tarde."}],
 "energym.profesionales.demo.Martina López":[{area:"Nutrición y bioimpedancia",date:date(-2),author:"Profesional de prueba",topic:"Primer control",measures:["68","",""],notes:"Registro ficticio para la presentación.",next:date(12),shared:"Consultar con el equipo antes de la próxima clase."}]};
 for(const [k,v] of Object.entries(examples))if(localStorage.getItem(k)===null)localStorage.setItem(k,JSON.stringify(v));
 for(let i=0;i<7;i++){const d=date(i);for(const [hour,state] of [[10,"Ocupado"],[18,"Libre"]]){const k="energym.turno."+d+"."+hour;if(localStorage.getItem(k)===null)localStorage.setItem(k,state);}}
 localStorage.setItem(key,"1");
})();
