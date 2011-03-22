var porosus = (function() {
    // private static variable
    var version = 0;
    
    return function(canvasID) {
        
        var canvas = $(canvasID); // the canvas element
        var gl = porosus.initWebGL(canvas);
        
        var triangleVertexPositionBuffer;
        var triangleVertexColorBuffer;
        var squareVertexPositionBuffer;
        var squareVertexColorBuffer;
        
        var pyramidVertexPositionBuffer;
        var pyramidVertexColorBuffer;
        var cubeVertexPositionBuffer;
        var cubeVertexColorBuffer;
        var cubeVertexIndexBuffer;
        
        var shaderProgram;
        
        var mvMatrix = mat4.create();
        var pMatrix = mat4.create();
        var mvMatrixStack = [];
        
        var rPyramid = 0;
        var rCube = 0;
        
        var lastTime = 0;
        
        // priviledged public function
        this.getVersion = function() {
            return version;
        };
        
        this.getGl = function() {
            return gl;
        };
        
        this.drawTest = function() {
            gl.clearColor(0.0, 0.0, 0.0, 1.0);                      // Set clear color to black, fully opaque
            gl.clearDepth(1.0);                                     // Clear everything
            gl.enable(gl.DEPTH_TEST);                               // Enable depth testing
            gl.depthFunc(gl.LEQUAL);                                // Near things obscure far things
            gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);      // Clear the color as well as the depth buffer.
        };
        
        var initBuffers = function() {
            /*
             * initialises buffers
             */
             
             // INIT PYRAMID
            pyramidVertexPositionBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, pyramidVertexPositionBuffer);
            var vertices = [
                // Front face
                 0.0,  1.0,  0.0,
                -1.0, -1.0,  1.0,
                 1.0, -1.0,  1.0,
                // Right face
                 0.0,  1.0,  0.0,
                 1.0, -1.0,  1.0,
                 1.0, -1.0, -1.0,
                // Back face
                 0.0,  1.0,  0.0,
                 1.0, -1.0, -1.0,
                -1.0, -1.0, -1.0,
                // Left face
                 0.0,  1.0,  0.0,
                -1.0, -1.0, -1.0,
                -1.0, -1.0,  1.0
            ];
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
            pyramidVertexPositionBuffer.itemSize = 3;
            pyramidVertexPositionBuffer.numItems = 12;
             
            pyramidVertexColorBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, pyramidVertexColorBuffer);
            var colors = [
                // Front face
                1.0, 0.0, 0.0, 1.0,
                0.0, 1.0, 0.0, 1.0,
                0.0, 0.0, 1.0, 1.0,
                // Right face
                1.0, 0.0, 0.0, 1.0,
                0.0, 0.0, 1.0, 1.0,
                0.0, 1.0, 0.0, 1.0,
                // Back face
                1.0, 0.0, 0.0, 1.0,
                0.0, 1.0, 0.0, 1.0,
                0.0, 0.0, 1.0, 1.0,
                // Left face
                1.0, 0.0, 0.0, 1.0,
                0.0, 0.0, 1.0, 1.0,
                0.0, 1.0, 0.0, 1.0
            ];
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
            pyramidVertexColorBuffer.itemSize = 4;
            pyramidVertexColorBuffer.numItems = 12;
     
     
     
            // INIT CUBE
            cubeVertexPositionBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
            vertices = [
              // Front face
              -1.0, -1.0,  1.0,
               1.0, -1.0,  1.0,
               1.0,  1.0,  1.0,
              -1.0,  1.0,  1.0,
        
              // Back face
              -1.0, -1.0, -1.0,
              -1.0,  1.0, -1.0,
               1.0,  1.0, -1.0,
               1.0, -1.0, -1.0,
        
              // Top face
              -1.0,  1.0, -1.0,
              -1.0,  1.0,  1.0,
               1.0,  1.0,  1.0,
               1.0,  1.0, -1.0,
        
              // Bottom face
              -1.0, -1.0, -1.0,
               1.0, -1.0, -1.0,
               1.0, -1.0,  1.0,
              -1.0, -1.0,  1.0,
        
              // Right face
               1.0, -1.0, -1.0,
               1.0,  1.0, -1.0,
               1.0,  1.0,  1.0,
               1.0, -1.0,  1.0,
        
              // Left face
              -1.0, -1.0, -1.0,
              -1.0, -1.0,  1.0,
              -1.0,  1.0,  1.0,
              -1.0,  1.0, -1.0
            ];
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
            cubeVertexPositionBuffer.itemSize = 3;
            cubeVertexPositionBuffer.numItems = 24;
            
            cubeVertexColorBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexColorBuffer);
            colors = [
              [1.0, 0.0, 0.0, 1.0],     // Front face
              [1.0, 1.0, 0.0, 1.0],     // Back face
              [0.0, 1.0, 0.0, 1.0],     // Top face
              [1.0, 0.5, 0.5, 1.0],     // Bottom face
              [1.0, 0.0, 1.0, 1.0],     // Right face
              [0.0, 0.0, 1.0, 1.0]     // Left face
            ];
            var unpackedColors = [];
            for (var i in colors) {
                if(colors[i].constructor == Array) {
                    var color = colors[i];
                    for (var j=0; j < 4; j++) {
                        unpackedColors = unpackedColors.concat(color);
                    }
                }
            }
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(unpackedColors), gl.STATIC_DRAW);
            cubeVertexColorBuffer.itemSize = 4;
            cubeVertexColorBuffer.numItems = 24;
            
            cubeVertexIndexBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
            var cubeVertexIndices = [
              0, 1, 2,      0, 2, 3,    // Front face
              4, 5, 6,      4, 6, 7,    // Back face
              8, 9, 10,     8, 10, 11,  // Top face
              12, 13, 14,   12, 14, 15, // Bottom face
              16, 17, 18,   16, 18, 19, // Right face
              20, 21, 22,   20, 22, 23  // Left face
            ];
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices), gl.STATIC_DRAW);
            cubeVertexIndexBuffer.itemSize = 1;
            cubeVertexIndexBuffer.numItems = 36;
        };
        
        var mvPushMatrix = function () {
            var copy = mat4.create();
            mat4.set(mvMatrix, copy);
            mvMatrixStack.push(copy);
        };
        
        var degToRad = function(deg) {
            var rad = (deg*Math.PI)/180;
            return rad;
        };
        
        var mvPopMatrix = function () {
            if (mvMatrixStack.length === 0) {
                throw "Invalid popMatrix!";
            }
            mvMatrix = mvMatrixStack.pop();
        };
        
        var initShaders = function() {
            var fragmentShader = porosus.getShader(gl, "shader-fs");
            var vertexShader = porosus.getShader(gl, "shader-vs");
     
            shaderProgram = gl.createProgram();
            gl.attachShader(shaderProgram, vertexShader);
            gl.attachShader(shaderProgram, fragmentShader);
            gl.linkProgram(shaderProgram);
     
            if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
                alert("Could not initialise shaders");
            }
     
            gl.useProgram(shaderProgram);
     
            shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
            gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
            
            shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
            gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);
     
            shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
            shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
        };
        
        var setMatrixUniforms = function () {
            gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
            gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
        };
        
        var animate = function() {
            var timeNow = new Date().getTime();
            if (lastTime !== 0) {
                var elapsed = timeNow - lastTime;
                
                rPyramid += (90 * elapsed) / 1000.0;
                rCube += (75 * elapsed) / 1000.0;
            }
            lastTime = timeNow;
        };
        
        var drawScene = function () {
            gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
     
            mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);
            mat4.identity(mvMatrix);
     

            mat4.translate(mvMatrix, [-1.5, 0.0, -7.0]);
            
            mvPushMatrix();
            mat4.rotate(mvMatrix, degToRad(rPyramid), [0, 1, 0]);
            gl.bindBuffer(gl.ARRAY_BUFFER, pyramidVertexPositionBuffer);
            gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, pyramidVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
            gl.bindBuffer(gl.ARRAY_BUFFER, pyramidVertexColorBuffer);
            gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, pyramidVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
            setMatrixUniforms();
            gl.drawArrays(gl.TRIANGLES, 0, pyramidVertexPositionBuffer.numItems);
            mvPopMatrix();
     
     
            mat4.translate(mvMatrix, [3.0, 0.0, 0.0]);
            
            mvPushMatrix();
            mat4.rotate(mvMatrix, degToRad(rCube), [1, 1, 1]);
            gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
            gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
            gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexColorBuffer);
            gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, cubeVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
            setMatrixUniforms();
            gl.drawElements(gl.TRIANGLES, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
            mvPopMatrix();
        }
        
        var tick = function() {
            requestAnimFrame(tick);
            
            drawScene();
            animate();
        };
        
        initShaders();
        initBuffers();
 
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.enable(gl.DEPTH_TEST);
 
        drawScene();
        
        tick();
    };
})();

porosus.initWebGL = function(canvas) {
    /*
     * takes the canvas element and returns the 3d context element
     */
    var gl = null;
    try {
        gl = canvas.getContext("experimental-webgl");
        canvas.width=window.innerWidth;
        canvas.height=window.innerHeight;
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
    }
    catch(e) {
    }
    if (!gl) { // If we don't have a GL context, give up now
        alert("Unable to initialize WebGL. Your browser may not support it.");
    }
    return gl;
};

porosus.getShader = function(gl, id) {
        var shaderScript = document.getElementById(id);
        if (!shaderScript) {
            return null;
        }
 
        var str = "";
        var k = shaderScript.firstChild;
        while (k) {
            if (k.nodeType == 3) {
                str += k.textContent;
            }
            k = k.nextSibling;
        }
 
        var shader;
        if (shaderScript.type == "x-shader/x-fragment") {
            shader = gl.createShader(gl.FRAGMENT_SHADER);
        } else if (shaderScript.type == "x-shader/x-vertex") {
            shader = gl.createShader(gl.VERTEX_SHADER);
        } else {
            return null;
        }
 
        gl.shaderSource(shader, str);
        gl.compileShader(shader);
 
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert(gl.getShaderInfoLog(shader));
            return null;
        }
 
        return shader;
    };

croco = new porosus('canvas');