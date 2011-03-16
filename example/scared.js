        var context = document.getElementById('crowdControl').getContext('2d');
    	var mousex=0,mousey=0;
        var necrophobia = 100;
        var necro = necrophobia;
        var impuls = 0;
        
		var imagine=new Image();        
		imagine.src = 'person.svg';
		
		function crowd() {
			this.x=Math.random()*context.canvas.width;
			this.y=Math.random()*context.canvas.height;
			this.vx=0;
			this.vy=0;
			this.move=crowd_move;
			this.draw=crowd_draw;
		}
		
		function crowd_move() {
			this.x+=this.vx;
			this.y+=this.vy;
			this.vx*=0.9;
			this.vy*=0.9;
			this.vx+=(Math.random()-0.5) *0.1;
			this.vy+=(Math.random()-0.5) *0.1;
			this.x=(this.x*500+context.canvas.width/2)/501;
			this.y=(this.y*500+context.canvas.height/2)/501;
		}
		
		function crowd_draw(){
			context.save();
			context.beginPath();
			context.translate(this.x,this.y);
			context.rotate((this.vx-this.vy)*Math.PI*0.1);// angle(this.vx,this.vy)
			context.drawImage(imagine,-15,-36,15,36);
			context.fillStyle = 'white';
			context.fill();
			context.restore();
		}
		
		var people=new Array();
		
		function begin() {
			for(var i=0;i<100;i++) {
				var temp=new crowd();
				people.push(temp);
			}
		}
		
		function work() {
			var x;
            impuls++;
			context.save();
			context.beginPath();
			context.fillStyle="yellow";
			context.strokeStyle="white";
			context.rect(0,0,context.canvas.width, context.canvas.height);
			context.fill();
			context.stroke();
			context.restore();
			for(x in people){
				var y;
				for(y in people) {
					if(y!=x) {
						var dx=people[y].x*people[x].x;
						var dy=people[y].y*people[x].y;
						var d=Math.sqrt(dx*dx+dy*dy);
						if(d<80) {
							people[x].vx+=20* (-dx/(d*d));
							people[x].vy+=20* (-dy/(d*d));
						} else if (d<300) {
							people[x].vx+=0.07* (dx/d);
							people[x].vy+=0.07* (dx/d);
						}
					}
				}
				var dx=mousex-people[x].x;
				var dy=mousey-people[x].y;
				var d=Math.sqrt(dx*dx+dy*dy);
				if(d<necro) {
					people[x].vx-=1* (dx/(d));
					people[x].vy-=1* (dy/(d));
				}
				people[x].move();
				people[x].draw();
			}
            

            // draw scaring area
            var tool = context.createRadialGradient(mousex,mousey,(Math.sin(impuls/10)*Math.sin(impuls/10))*(necro-10),mousex,mousey,necro);
            //console.log((Math.sin(impuls/10)*Math.sin(impuls/10)) + "  ---    " + impuls);
            tool.addColorStop(0, 'rgba(255,10,10,.5)');
            tool.addColorStop(1, 'rgba(100,10,10,0)');
            
            context.fillStyle = tool;
            //console.log("Mouse X = " + mousex);
            context.fillRect(mousex-necro,mousey-necro,necro*2,necro*2);
		}
		
		function mmouse(event) {
			mousex=event.pageX;
			mousey=event.pageY;
		}
        
        function adjustNecrophobia(newValue) {
            necro = newValue;
            console.log("Necrophobia changed to " + newValue);
        }
		
		context.canvas.onmousemove = mmouse;
		
		function resize_context(){
			context.canvas.width=window.innerWidth;
			context.canvas.height=window.innerHeight;
		}
		window.onresize=resize_context;
		onLoad=resize_context();
		onLoad=begin();
		setInterval(work,10);