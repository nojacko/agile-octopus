import{s as M,n as I,e as T}from"../chunks/scheduler.682ccc96.js";import{S as j,i as q,g as v,m as V,s as k,h,j as b,n as S,f as p,c as C,x as w,k as c,l as A,a as B,y as a,o as L}from"../chunks/index.eeb576cb.js";import{d as P}from"../chunks/singletons.d73e3abb.js";const z=()=>{const t=P;return{page:{subscribe:t.page.subscribe},navigating:{subscribe:t.navigating.subscribe},updated:t.updated}},F={subscribe(t){return z().page.subscribe(t)}};function G(t){let s,r,e,n,f=t[0].status+"",_,x,d,m=t[0].error.message+"",g,y,o,E='<i class="fa-solid fa-arrow-left"></i> Back to Home Page';return{c(){s=v("div"),r=v("div"),e=v("div"),n=v("h1"),_=V(f),x=k(),d=v("div"),g=V(m),y=k(),o=v("a"),o.innerHTML=E,this.h()},l(i){s=h(i,"DIV",{class:!0,style:!0});var l=b(s);r=h(l,"DIV",{class:!0});var $=b(r);e=h($,"DIV",{class:!0});var u=b(e);n=h(u,"H1",{class:!0});var D=b(n);_=S(D,f),D.forEach(p),x=C(u),d=h(u,"DIV",{class:!0});var H=b(d);g=S(H,m),H.forEach(p),y=C(u),o=h(u,"A",{href:!0,class:!0,"data-svelte-h":!0}),w(o)!=="svelte-1un1lxp"&&(o.innerHTML=E),u.forEach(p),$.forEach(p),l.forEach(p),this.h()},h(){c(n,"class","card-title mb-4 display-1"),c(d,"class","card-subtitle mb-4 lead"),c(o,"href","/"),c(o,"class","btn btn-secondary"),c(e,"class","card-body"),c(r,"class","card d-block mx-auto text-center align-self-center"),c(s,"class","container d-flex"),A(s,"height","100vh")},m(i,l){B(i,s,l),a(s,r),a(r,e),a(e,n),a(n,_),a(e,x),a(e,d),a(d,g),a(e,y),a(e,o)},p(i,[l]){l&1&&f!==(f=i[0].status+"")&&L(_,f),l&1&&m!==(m=i[0].error.message+"")&&L(g,m)},i:I,o:I,d(i){i&&p(s)}}}function J(t,s,r){let e;return T(t,F,n=>r(0,e=n)),[e]}let Q=class extends j{constructor(s){super(),q(this,s,J,G,M,{})}};export{Q as component};
