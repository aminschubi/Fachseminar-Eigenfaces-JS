import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'my-angular-electron-app-demo';
  fs: any;
  dialog: any;
  ngAfterViewInit() {
    //@ts-ignore
    this.fs = window.fs;
    //@ts-ignore
    this.dialog = window.dialog;
    console.log("HI");
    var width = 195;
    var height = 231;
    var c = <HTMLCanvasElement>document.getElementById("myCanvas");
    var ctx = c.getContext("2d");
    var imgData;
    var imageVectors: number[][] = [];
    var k = 15;
    for (let i = 1; i < k + 1; i++) {
      let urlstring = "";
      if (i < 10) {
        urlstring = "./dist/eigenfaces/assets/subject0" + i + ".normal.pgm";
      } else {
        urlstring = "./dist/eigenfaces/assets/subject" + i + ".normal.pgm";
      }
      this.fs.readFile(urlstring, function (err, data) {
        if (err) throw err;
        imageVectors.push([]);
        imgData = data;
        let cx = 0;
        let cy = 0;
        let c = 1;
        let diff = data.length - width * height
        for (const b of imgData) {
          c++;
          if (c >= diff) {
            imageVectors[imageVectors.length - 1].push(+b);
            cx++;
          }
          if (cx == width) {
            cx = 0;
            cy++;
          }
        }

        if (i === 15) {
          let sumOfVectors: number[] = Object.assign([], imageVectors[0]);
          for (let i = 1; i < k; i++) {
            sumOfVectors.forEach((number: number, index: number) => {
              sumOfVectors[index] = sumOfVectors[index] + imageVectors[i][index];
            });
          }
          console.log("Sum:" + sumOfVectors);
          sumOfVectors.forEach((number: number, index: number) => {
            sumOfVectors[index] = sumOfVectors[index] * (1 / k);
          });
          console.log("Mean:" + sumOfVectors);
          let meanOfVectors: number[] = Object.assign([], sumOfVectors);

          cx = 0;
          cy = 0;
          for (const b of sumOfVectors) {
            imageVectors[imageVectors.length - 1].push(+b);
            //dataString += " " + b;
            ctx.fillStyle = "rgb(" + b + "," + b + "," + b + ")";
            ctx.fillRect(cx, cy, 1, 1);
            cx++;
            if (cx == width) {
              cx = 0;
              cy++;
              //dataString += "\n";
            }
          }

          let diffImgVectors: number[][] = [];

          imageVectors.forEach((vector: number[], index: number) => {
            diffImgVectors.push([]);
            let i = index;
            vector.forEach((value: number, index: number) => {
              diffImgVectors[diffImgVectors.length - 1].push(vector[i] - meanOfVectors[i]);
            });
          });

          console.log(diffImgVectors);
        }
      });
    }
  }

}
