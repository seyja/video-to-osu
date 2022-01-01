const fs = require("fs");
const {fps,filePath}=require("./config.json")
const {spawn}=require("child_process");
let t=new Date().getTime()/1000

fs.rmSync("./frames", { recursive: true, force: true })
fs.rmSync("./output", { recursive: true, force: true })
fs.mkdirSync("./frames")
fs.mkdirSync("./output")
console.log("hold on...")

const cp=spawn("ffmpeg",["-i",filePath,"-filter:v","fps="+fps,"frames/%d.png"]);

cp.on("close",()=>{
    spawn("img2ascii").on("close",()=>{
        let q=""
        const s=fs.readdirSync("./output/").sort((a,b)=>(a.match(/\d+/)[0]-0)<(b.match(/\d+/)[0]-0)?-1:1)
        
        s.forEach((i,o)=>{
            let w = [];
            const h = fs.readFileSync("output/"+i).toString();
            function clear(h) {
                const arr = [...h];
                let ll = h.match("(.+\n)")?.[1].length || h.length;
            let d = "";
            arr.forEach((char, b) => {
                if (char == " ") {
                    d += " ";
                    return;
                }
                if (arr[b - 1] == char && arr[b - 1 - ll] == char && arr[b - ll] == char && arr[b + ll] == char && arr[b + 1] == char && arr[b + 1 + ll] == char) {
                    d += " ";
                    return;
                }
        
                d += char;
            });
            return d;
        }
        
        let f = [...clear(h)];
        const pos = {};
        ll = (f.join("").match("(.+\n)")?.[1].length || h.length);
        let y = 1;
        
        f.forEach((a, b) => {
            pos[b] = [3 * (b % ll + 2) + 1, y * 5];
            if (a == "\n") y++;
        });
        f.forEach((arr, p) => {
        
            if (arr != " " && arr != "\n" && arr != "\r") {
                w.push(pos[p]);
            }
            
        });
        q+="\n"+w.map((a) => a + ","+o*(1000/fps)+",1,0,0:0:0:0:").join("\n");
        
        })        
        fs.writeFileSync("output.txt", q);
        console.log("done in "+((new Date().getTime()/1000)-t)+" seconds")
        console.log("create a map (100bpm) and then copy the output.txt file and paste it under [HitObjects]")
    })
})
