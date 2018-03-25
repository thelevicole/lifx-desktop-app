"use strict";!function(t){t.fn.LifxColorPicker=function(a){var e=this;a=t.extend(!0,{hue:0,saturation:.5,brightness:1,size:320,changed:function(t){}},a),e.data={hue:0,saturation:0,brightness:0};var n={rotation:0,brightness:0},o=this.find(".dial"),s=this.find(".color .handle"),i=this.find(".brightness .handle"),r=document.createElement("canvas"),u=r.getContext("2d");r.width=a.size,r.height=a.size,u.scale(2,2);var h=a.size/4,d=a.size/4,c=h,f=Math.PI/180,g=180/Math.PI,l=o.offset().left+2*c,v=o.offset().top+2*c;e.hsl=function(){var t=e.data.hue,a=Math.round(100*e.data.saturation);return"hsl("+t+", "+a+"%, "+Math.round(a<50?100-a:50)+"%)"};var p=function(t,a){var e=Math.atan2(t-l,a-v);return Math.round(e*g*-1+100)},b=function(){var t=e.hsl(),r=(1-e.data.saturation)*(s.parent().outerHeight()-s.outerHeight());if(o.css("transform","rotate("+n.rotation+"deg)"),s.css("background",t),s.css("top",r+"px"),i.css("top",-n.brightness*i.height()+"px"),"function"==typeof a.changed){var u=e.data;u.hsl=e.hsl(),u.brightness=parseFloat(u.brightness),u.saturation=parseFloat(u.saturation),a.changed(u)}};e.set_hue=function(t){var a=void 0!==t?t:e.data.hue;a>360&&(a-=360),a<0&&(a=360-Math.abs(a)),e.data.hue=Math.round(360-a),n.rotation=t,b()},e.set_saturation=function(t){(t=void 0!==t?t:e.data.saturation)>1&&(t=1),t<0&&(t=0),e.data.saturation=t.toFixed(2),b()},e.set_brightness=function(t){(t=void 0!==t?t:e.data.brightness)>1&&(t=1),t<0&&(t=0),e.data.brightness=t.toFixed(2),n.brightness=t,b()},e.set_color=function(t,a,n){e.set_hue(t),e.set_saturation(a),e.set_brightness(n)},o.on("mousedown",function(a){var n=p(a.pageX,a.pageY);t(document).bind("mousemove",function(t){var a=p(t.pageX,t.pageY)-n;e.set_hue(a)})}),s.on("mousedown",function(){t(document).bind("mousemove",function(t){var a=s.parent(),n=s.outerWidth(),o=n/2,i=a.outerHeight()-n,r=a.offset(),u=t.clientY-(r.top+o);u>i&&(u=i),u<0&&(u=0),e.set_saturation(1-u/i)})}),i.parent().on("mousedown",function(a){var n=a.clientY,o=parseInt(i.css("top"));t(document).bind("mousemove",o,function(t){var a=i.height(),s=o-(n-t.clientY);s>0&&(s=0),s<-a&&(s=-a),e.set_brightness(Math.abs(s)/a)})}),t(document).on("mouseup",function(){t(document).unbind("mousemove")}),function(){for(var t=0;t<=360;t++){var a=(t-90)*f,e=(t-88)*f;u.beginPath(),u.moveTo(h,d),u.arc(h,d,c,a,e,!1),u.closePath();var n=u.createRadialGradient(h,d,0,h,d,c);n.addColorStop(.475,"hsl("+t+", 10%, 100%)"),n.addColorStop(1,"hsl("+t+", 100%, 50%)"),u.fillStyle=n,u.fill()}o.css("background-image","url("+r.toDataURL("image/png",1)+")")}(),e.set_color(Math.round(360-a.hue),parseFloat(a.saturation),parseFloat(a.brightness))}}(jQuery);