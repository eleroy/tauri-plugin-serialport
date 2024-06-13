function t(t,e,r,n){return new(r||(r=Promise))((function(i,s){function o(t){try{u(n.next(t))}catch(t){s(t)}}function a(t){try{u(n.throw(t))}catch(t){s(t)}}function u(t){var e;t.done?i(t.value):(e=t.value,e instanceof r?e:new r((function(t){t(e)}))).then(o,a)}u((n=n.apply(t,e||[])).next())}))}function e(t,e){var r,n,i,s,o={label:0,sent:function(){if(1&i[0])throw i[1];return i[1]},trys:[],ops:[]};return s={next:a(0),throw:a(1),return:a(2)},"function"==typeof Symbol&&(s[Symbol.iterator]=function(){return this}),s;function a(a){return function(u){return function(a){if(r)throw new TypeError("Generator is already executing.");for(;s&&(s=0,a[0]&&(o=0)),o;)try{if(r=1,n&&(i=2&a[0]?n.return:a[0]?n.throw||((i=n.return)&&i.call(n),0):n.next)&&!(i=i.call(n,a[1])).done)return i;switch(n=0,i&&(a=[2&a[0],i.value]),a[0]){case 0:case 1:i=a;break;case 4:return o.label++,{value:a[1],done:!1};case 5:o.label++,n=a[1],a=[0];continue;case 7:a=o.ops.pop(),o.trys.pop();continue;default:if(!(i=o.trys,(i=i.length>0&&i[i.length-1])||6!==a[0]&&2!==a[0])){o=0;continue}if(3===a[0]&&(!i||a[1]>i[0]&&a[1]<i[3])){o.label=a[1];break}if(6===a[0]&&o.label<i[1]){o.label=i[1],i=a;break}if(i&&o.label<i[2]){o.label=i[2],o.ops.push(a);break}i[2]&&o.ops.pop(),o.trys.pop();continue}a=e.call(t,o)}catch(t){a=[6,t],n=0}finally{r=i=0}if(5&a[0])throw a[1];return{value:a[0]?a[1]:void 0,done:!0}}([a,u])}}}function r(t,e=!1){return window.__TAURI_INTERNALS__.transformCallback(t,e)}async function n(t,e={},r){return window.__TAURI_INTERNALS__.invoke(t,e,r)}var i;async function s(t,e,i){var s;const o="string"==typeof(null==i?void 0:i.target)?{kind:"AnyLabel",label:i.target}:null!==(s=null==i?void 0:i.target)&&void 0!==s?s:{kind:"Any"};return n("plugin:event|listen",{event:t,target:o,handler:r(e)}).then((e=>async()=>async function(t,e){await n("plugin:event|unlisten",{event:t,eventId:e})}(t,e)))}"function"==typeof SuppressedError&&SuppressedError,"function"==typeof SuppressedError&&SuppressedError,function(t){t.WINDOW_RESIZED="tauri://resize",t.WINDOW_MOVED="tauri://move",t.WINDOW_CLOSE_REQUESTED="tauri://close-requested",t.WINDOW_DESTROYED="tauri://destroyed",t.WINDOW_FOCUS="tauri://focus",t.WINDOW_BLUR="tauri://blur",t.WINDOW_SCALE_FACTOR_CHANGED="tauri://scale-change",t.WINDOW_THEME_CHANGED="tauri://theme-changed",t.WINDOW_CREATED="tauri://window-created",t.WEBVIEW_CREATED="tauri://webview-created",t.DRAG="tauri://drag",t.DROP="tauri://drop",t.DROP_OVER="tauri://drop-over",t.DROP_CANCELLED="tauri://drag-cancelled"}(i||(i={}));var o=function(){function r(t){this.isOpen=!1,this.encoding=t.encoding||"utf-8",this.options={path:t.path,baudRate:t.baudRate,dataBits:t.dataBits||"Eight",flowControl:t.flowControl||"None",parity:t.parity||"None",stopBits:t.stopBits||"Two",dtr:t.dtr||!1,timeout:t.timeout||200},this.size=t.size||1024}return r.available_ports=function(){return t(this,void 0,void 0,(function(){var t;return e(this,(function(e){switch(e.label){case 0:return e.trys.push([0,2,,3]),[4,n("plugin:serialport|available_ports")];case 1:return[2,e.sent()];case 2:return t=e.sent(),[2,Promise.reject(t)];case 3:return[2]}}))}))},r.forceClose=function(r){return t(this,void 0,void 0,(function(){return e(this,(function(t){switch(t.label){case 0:return[4,n("plugin:serialport|force_close",{path:r})];case 1:return[2,t.sent()]}}))}))},r.closeAll=function(){return t(this,void 0,void 0,(function(){return e(this,(function(t){switch(t.label){case 0:return[4,n("plugin:serialport|close_all")];case 1:return[2,t.sent()]}}))}))},r.prototype.cancelListen=function(){return t(this,void 0,void 0,(function(){return e(this,(function(t){try{return this.unListen&&(this.unListen(),this.unListen=void 0),[2]}catch(t){return[2,Promise.reject("取消串口监听失败: "+t)]}return[2]}))}))},r.prototype.cancelRead=function(){return t(this,void 0,void 0,(function(){var t;return e(this,(function(e){switch(e.label){case 0:return e.trys.push([0,2,,3]),[4,n("plugin:serialport|cancel_read",{path:this.options.path})];case 1:return[2,e.sent()];case 2:return t=e.sent(),[2,Promise.reject(t)];case 3:return[2]}}))}))},r.prototype.change=function(r){return t(this,void 0,void 0,(function(){var t,n;return e(this,(function(e){switch(e.label){case 0:return e.trys.push([0,5,,6]),t=!1,this.isOpen?(t=!0,[4,this.close()]):[3,2];case 1:e.sent(),e.label=2;case 2:return r.path&&(this.options.path=r.path),r.baudRate&&(this.options.baudRate=r.baudRate),t?[4,this.open()]:[3,4];case 3:e.sent(),e.label=4;case 4:return[2,Promise.resolve()];case 5:return n=e.sent(),[2,Promise.reject(n)];case 6:return[2]}}))}))},r.prototype.close=function(){return t(this,void 0,void 0,(function(){var t,r;return e(this,(function(e){switch(e.label){case 0:return e.trys.push([0,4,,5]),this.isOpen?[4,this.cancelRead()]:[2];case 1:return e.sent(),[4,n("plugin:serialport|close",{path:this.options.path})];case 2:return t=e.sent(),[4,this.cancelListen()];case 3:return e.sent(),this.isOpen=!1,[2,t];case 4:return r=e.sent(),[2,Promise.reject(r)];case 5:return[2]}}))}))},r.prototype.listen=function(r,n){return void 0===n&&(n=!0),t(this,void 0,void 0,(function(){var t,i,o,a=this;return e(this,(function(e){switch(e.label){case 0:return e.trys.push([0,3,,4]),[4,this.cancelListen()];case 1:return e.sent(),t="plugin-serialport-read-"+this.options.path,i=this,[4,s(t,(function(t){var e=t.payload;try{if(n){var i=new TextDecoder(a.encoding).decode(new Uint8Array(e));r(i)}else r(new Uint8Array(e))}catch(t){console.error(t)}}))];case 2:return i.unListen=e.sent(),[2];case 3:return o=e.sent(),[2,Promise.reject("监听串口数据失败: "+o)];case 4:return[2]}}))}))},r.prototype.open=function(){return t(this,void 0,void 0,(function(){var t,r;return e(this,(function(e){switch(e.label){case 0:return e.trys.push([0,2,,3]),this.options.path?this.options.baudRate?this.isOpen?[2]:[4,n("plugin:serialport|open",{path:this.options.path,baudRate:this.options.baudRate,dataBits:this.options.dataBits,flowControl:this.options.flowControl,parity:this.options.parity,stopBits:this.options.stopBits,dtr:this.options.dtr,timeout:this.options.timeout})]:[2,Promise.reject("baudRate 不能为空!")]:[2,Promise.reject("path 不能为空!")];case 1:return t=e.sent(),this.isOpen=!0,[2,Promise.resolve(t)];case 2:return r=e.sent(),[2,Promise.reject(r)];case 3:return[2]}}))}))},r.prototype.read=function(r){return t(this,void 0,void 0,(function(){var t;return e(this,(function(e){switch(e.label){case 0:return e.trys.push([0,2,,3]),[4,n("plugin:serialport|read",{path:this.options.path,timeout:(null==r?void 0:r.timeout)||this.options.timeout})];case 1:return[2,e.sent()];case 2:return t=e.sent(),[2,Promise.reject(t)];case 3:return[2]}}))}))},r.prototype.setBaudRate=function(r){return t(this,void 0,void 0,(function(){var t,n;return e(this,(function(e){switch(e.label){case 0:return e.trys.push([0,5,,6]),t=!1,this.isOpen?(t=!0,[4,this.close()]):[3,2];case 1:e.sent(),e.label=2;case 2:return this.options.baudRate=r,t?[4,this.open()]:[3,4];case 3:e.sent(),e.label=4;case 4:return[2,Promise.resolve()];case 5:return n=e.sent(),[2,Promise.reject(n)];case 6:return[2]}}))}))},r.prototype.setPath=function(r){return t(this,void 0,void 0,(function(){var t,n;return e(this,(function(e){switch(e.label){case 0:return e.trys.push([0,5,,6]),t=!1,this.isOpen?(t=!0,[4,this.close()]):[3,2];case 1:e.sent(),e.label=2;case 2:return this.options.path=r,t?[4,this.open()]:[3,4];case 3:e.sent(),e.label=4;case 4:return[2,Promise.resolve()];case 5:return n=e.sent(),[2,Promise.reject(n)];case 6:return[2]}}))}))},r.prototype.write=function(r){return t(this,void 0,void 0,(function(){var t;return e(this,(function(e){switch(e.label){case 0:return e.trys.push([0,2,,3]),this.isOpen?[4,n("plugin:serialport|write",{value:r,path:this.options.path})]:[2,Promise.reject("串口 ".concat(this.options.path," 未打开!"))];case 1:return[2,e.sent()];case 2:return t=e.sent(),[2,Promise.reject(t)];case 3:return[2]}}))}))},r.prototype.writeBinary=function(r){return t(this,void 0,void 0,(function(){var t;return e(this,(function(e){switch(e.label){case 0:return e.trys.push([0,4,,5]),this.isOpen?r instanceof Uint8Array||r instanceof Array?[4,n("plugin:serialport|write_binary",{value:Array.from(r),path:this.options.path})]:[3,2]:[2,Promise.reject("串口 ".concat(this.options.path," 未打开!"))];case 1:return[2,e.sent()];case 2:return[2,Promise.reject("value 参数类型错误! 期望类型: string, Uint8Array, number[]")];case 3:return[3,5];case 4:return t=e.sent(),[2,Promise.reject(t)];case 5:return[2]}}))}))},r}();export{o as Serialport};
