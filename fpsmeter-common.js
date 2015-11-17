/**
#  Authors:
#     Zhou, Weiwei <weiweix.zhou@intel.com>
*/
window.requestAnimationFrame =  
	window.mozRequestAnimationFrame || 
	window.msRequestAnimationFrame || 
	window.requestAnimationFrame;

window.cancelRequestAnimationFrame = 
	window.mozCancelRequestAnimationFrame ||
	window.msCancelRequestAnimationFrame ||
	window.cancelAnimationFrame;

function fpsmeter(){
	if (!window.requestAnimationFrame) {
		clearTimeout(typeof(fps_id)=="undefined"? 0 : fps_id);
		setTimeout(function(){
		    if(typeof(BWS) != "undefined")
		        BWS.run.finish_round();
		    else
		        document.write("Workload doesn't support current browser.");	
		    return;
		},1000);
	}
	this.date = Date.now ? Date.now() : new Date().getTime();
	this.counter = 0;
	this.avg = 0;
	this.frame = 0;
	this.totalframes = 0;
	this.refresh_div = document.getElementById("commonfpscurr");
	if(this.refresh_div == null){
		this.refresh_div = document.createElement("div");
		style  = "position: fixed; top: 0px; z-index:100000; height: 30px; left: 0px; font-family: arial; color: rgb(0,0,0); text-align: center; line-height: 30px; font-size: 13px;font-weight:bold;background:rgb(255,255,255)";
		this.refresh_div.setAttribute("id","commonfpscurr");
		this.refresh_div.setAttribute("style",style);
		document.body.appendChild(this.refresh_div);
		this.refresh_div_curr = document.createElement("div");
		this.refresh_div_curr.setAttribute("style","float:left;");
		this.refresh_div_avg = document.createElement("div");
		this.refresh_div_avg.setAttribute("id","FPS");
		this.refresh_div_avg.setAttribute("style","float:left;");
		this.refresh_div_unit = document.createElement("div");
		this.refresh_div_unit.setAttribute("style","float:left;");
		this.refresh_div.appendChild(this.refresh_div_curr);
		this.refresh_div.appendChild(this.refresh_div_avg);
		this.refresh_div.appendChild(this.refresh_div_unit);
	}
}
fpsmeter.prototype.refresh = function(){
	currdate = Date.now ? Date.now() : new Date().getTime();
	this.frame += 1;
	if(currdate > (this.date + 1E3)){
		this.refresh_div_curr.innerHTML = "Cur: "+this.frame + "FPS/";
		this.refresh_div_avg.innerHTML = "Avg: " + this.avg;
		this.refresh_div_unit.innerHTML = "FPS";
		this.totalframes += this.frame;
		this.frame = 0;
		this.date = currdate;
		this.counter++;
	}
	if(this.counter == 10)
	{
		this.avg = (this.totalframes /10.0).toFixed(1);
		this.counter = 0;
		this.totalframes = 0;
	}
}
fpsmeter.prototype.end = function(){
	var commonfpscurr = document.getElementById("commonfpscurr");
	if (commonfpscurr){
		commonfpscurr.parentNode.removeChild(commonfpscurr);
	    commonfpscurr = null;
	}
}
