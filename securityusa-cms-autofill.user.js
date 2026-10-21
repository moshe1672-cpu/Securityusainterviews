// ==UserScript==
// @name         Security USA CMS – lead autofill
// @namespace    securityusa.cheatsheet
// @version      1.0
// @description  Fills the New Client form from the Sales Call Cheat Sheet "Send to CMS" button. Never clicks Save.
// @match        https://www.securityusacms.com/clients/new*
// @match        https://securityusacms.com/clients/new*
// @run-at       document-start
// @grant        none
// ==/UserScript==
(function(){
  'use strict';
  // Capture the payload immediately (the CMS app strips the URL hash on load).
  var m=/[#&]lead=([^&]+)/.exec(location.hash||'');
  if(!m) return;
  var lead; try{ lead=JSON.parse(decodeURIComponent(m[1])); }catch(e){ console.warn('CMS autofill: bad payload',e); return; }
  try{ history.replaceState(null,'',location.pathname+location.search); }catch(e){}

  var sleep=function(ms){ return new Promise(function(r){ setTimeout(r,ms); }); };
  function setVal(el,v){ if(!el) return; var proto=el.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto,'value').set.call(el,v||''); el.dispatchEvent(new Event('input',{bubbles:true})); el.dispatchEvent(new Event('change',{bubbles:true})); }
  function combos(){ return document.querySelectorAll('button[role=combobox]'); }
  async function pick(idx,text){
    if(!text) return; var trig=combos()[idx]; if(!trig) return;
    if(trig.textContent.trim()===text) return;
    trig.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true,pointerType:'mouse',button:0})); await sleep(250);
    var opt=Array.prototype.slice.call(document.querySelectorAll('[role=option]')).find(function(o){ return o.textContent.trim()===text; });
    if(!opt){ document.body.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true})); return; }
    opt.dispatchEvent(new PointerEvent('pointermove',{bubbles:true,pointerType:'mouse'}));
    opt.dispatchEvent(new PointerEvent('pointerup',{bubbles:true,pointerType:'mouse',button:0})); opt.click(); await sleep(250);
  }
  function banner(txt,ok){
    var b=document.createElement('div'); b.textContent=txt;
    b.style.cssText='position:fixed;top:0;left:0;right:0;z-index:99999;padding:10px 16px;font:14px/1.4 system-ui,sans-serif;color:#fff;background:'+(ok?'#0f4c81':'#b2641a')+';text-align:center';
    document.body.appendChild(b); setTimeout(function(){ b.remove(); },12000);
  }
  async function run(){
    if(document.readyState==='loading') await new Promise(function(r){ document.addEventListener('DOMContentLoaded',r,{once:true}); });
    for(var i=0;i<80&&!document.getElementById('contact_name');i++) await sleep(250);
    await sleep(300);
    if(!document.getElementById('contact_name')){ banner('Cheat sheet autofill: form not found on this page.',false); return; }
    setVal(document.getElementById('contact_name'),lead.contact_name);
    setVal(document.getElementById('phone'),lead.phone);
    setVal(document.getElementById('company_name'),lead.company);
    setVal(document.getElementById('email'),lead.email);
    var svcs=lead.services||[];
    for(var k=0;k<svcs.length;k++){ var sb=document.getElementById('service-'+svcs[k]); if(sb&&sb.getAttribute('data-state')!=='checked'){ sb.click(); await sleep(150); } }
    await pick(0,lead.office||'New York');
    await pick(1,lead.status||'In Progress');
    await pick(2,lead.lead_source||'');
    await pick(3,lead.sales_rep||'Moshe Sabaah');
    setVal(document.getElementById('notes'),lead.notes);
    setVal(document.getElementById('scope_of_service'),lead.scope);
    setVal(document.getElementById('sales_rep_actions'),lead.rep_actions);
    window.scrollTo(0,0);
    banner('Filled from the Sales Call Cheat Sheet — review, then click Save Client.',true);
  }
  run();
})();
