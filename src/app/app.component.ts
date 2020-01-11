import { Component } from '@angular/core';
import { Matrix, EigenvalueDecomposition } from 'ml-matrix';
import * as LinAl from 'src/linal/index';
import { pow } from 'src/linal/index';
import { setInterval } from 'timers';
//import { NumberMatrix, mat, calculateEigenvalues, MatrixBuilder, getEigenvectorForEigenvalue } from 'src/linal/index';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'my-angular-electron-app-demo';
  fs: any;
  dialog: any;
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  diffImgVectors: number[][] = [];
  eigenVectors: number[][];
  meanVector: number[];
  testSubject: number[];
  neededEigenVs: number = 0;
  t: NodeJS.Timer;

  cx: number = 0.0;
  cy: number = 0.0;
  ngAfterViewInit() {
    //@ts-ignore
    this.fs = window.fs;
    //@ts-ignore
    this.dialog = window.dialog;
    //console.log("HI");
    let width = 195;
    let height = 231;
    var c = <HTMLCanvasElement>document.getElementById("myCanvas");
    this.ctx = c.getContext("2d");
    var imgData;
    var imageVectors: number[][] = [];
    var k = 15;
    for (let j = 0; j < 10; j++) {
      for (let i = 1; i < k + 1; i++) {
        let urlstring = "";
        if (i < 10) {
          urlstring += "./dist/eigenfaces/assets/subject0" + i;
        } else {
          urlstring += "./dist/eigenfaces/assets/subject" + i;
        }

        switch (j) {
          case 0:
            urlstring += ".normal.pgm"
            break;
          case 1:
            urlstring += ".centerlight.pgm"
            break;
          case 2:
            urlstring += ".glasses.pgm"
            break;
          case 3:
            urlstring += ".happy.pgm"
            break;
          case 4:
            urlstring += ".leftlight.pgm"
            break;
          case 5:
            urlstring += ".noglasses.pgm"
            break;
          case 6:
            urlstring += ".rightlight.pgm"
            break;
          case 7:
            urlstring += ".sad.pgm"
            break;
          case 8:
            urlstring += ".sleepy.pgm"
            break;
          case 9:
            urlstring += ".surprised.pgm"
            break;
          case 10:
            urlstring += ".wink.pgm"
            break;
        }

        let t = this;
        this.fs.readFile(urlstring, function (err, data) {
          if (err) throw err;
          imageVectors.push([]);
          imgData = data;
          let c = 0;
          let start = 0;
          for (const b of imgData) {
            if (start == 0 && b == 255) {
              start = 1;
            }
            if (start == 1) {
              imageVectors[imageVectors.length - 1].push(+b);
              c++;
            }

          }
          //console.log(c);

          if (c != 45045) {
            for (let i = 0; i < 45045 - c; i++) {
              imageVectors[imageVectors.length - 1].push(255);
            }
          }


          if (i === 15 && j == 9) {
            let sumOfVectors: number[] = [];
            imageVectors[0].forEach((num: number, index: number) => {
              sumOfVectors.push(num);
            });
            ////console.log(imageVectors);
            for (let i = 1; i < k; i++) {
              sumOfVectors.forEach((number: number, index: number) => {
                ////console.log(index + "\n");
                sumOfVectors[index] = sumOfVectors[index] + imageVectors[i][index];
              });
            }
            //console.log("Sum:" + sumOfVectors);
            sumOfVectors.forEach((number: number, index: number) => {
              sumOfVectors[index] = sumOfVectors[index] * (1 / k);
            });
            t.meanVector = sumOfVectors;
            //console.log("Mean:" + sumOfVectors);
            //let meanOfVectors: number[] = Object.assign([], sumOfVectors);


            //let diffImageVectors : LinAl.FloatVector

            imageVectors.forEach((vector: number[], index: number) => {
              t.diffImgVectors.push([]);
              let i = index;
              vector.forEach((value: number, index: number) => {
                t.diffImgVectors[t.diffImgVectors.length - 1].push(value - sumOfVectors[index]);
              });
            });

            let A = new Matrix(t.diffImgVectors);
            let AT = new Matrix(t.diffImgVectors).transpose();
            let C = A.mmul(AT);

            console.log(C);


            let e = new EigenvalueDecomposition(C);
            let eigenV = e.eigenvectorMatrix;
            let eigenValues = e.realEigenvalues;

            let realEigenVArray: number[][] = [];
            eigenV.to2DArray().forEach((eigenvector: number[]) => {
              realEigenVArray.push(new Matrix([eigenvector]).mmul(A).to1DArray());
            });

            console.log(realEigenVArray);

            let eigsum = 0;
            for (let i = eigenValues.length - 1; i > 0; i--) {
              eigsum += eigenValues[i];
              ////console.log(eigsum);
            }

            let delta = eigenValues.length;
            let csum = 0;
            for (let j = eigenValues.length - 1; j > 0; j--) {
              csum += eigenValues[j];
              let tv = csum / eigsum;
              //console.log(eigsum, csum, tv);
              if (tv > 0.95) {
                delta = j;
                t.neededEigenVs = j;
                break;
              }
            }

            let usedEigenfaces = realEigenVArray.slice(delta, realEigenVArray.length - 1);
            t.eigenVectors = usedEigenfaces;
            //console.log(eigenValues.length);
            //console.log(delta);


            /*
            let test = imageVectors[15];
            let testWeights: number[][] = [];
 
            for (let i = delta; i < realEigenVArray.length - 1; i++) {
              let vKT = new Matrix([realEigenVArray[i]]).transpose();
              let U = new Matrix([test]);
              let M = new Matrix([sumOfVectors]);
              testWeights.push((U.sub(M)).mmul(vKT).to1DArray());
            }
 
            let candidates: number[] = [];
            
            for (let y = 0; y < pLength - 1; y++) {
              weights[y].forEach((weightVector: number[], index: number) => {
                let d = t.euklidischerAbstand(testWeights[index], weightVector);
                //console.log(d);
              });
            }*/

            ////console.log(weights[0]);

            /*
            let M = mat(t.diffImgVectors);
            let mT = mat(t.diffImgVectors).transpose();
            //console.log(M);
            let C = M.multiply(mT);
            //let C = M.transpose();
            //let cM = C.multiply(M);
            let e: LinAl.Vector<number> = calculateEigenvalues<number>(C);
            //let eT = calculateEigenvalues(Ct);
            //console.log(e);
            ////console.log(eT);
      
            let eigenVektoren: LinAl.Vector<number>[] = [];
      
            for (let i = 0; i < e.getDimension(); i++) {
              //console.log(getEigenvectorForEigenvalue(C, e.getEntry(i)));
            }
            */
            /*
            e.toArray().forEach((entry: number, index: number) => {
              eigenVektoren.push(getEigenvectorForEigenvalue(C, entry));
            });
            //console.log(eigenVektoren);
      
            */
            ////console.log(t.diffImgVectors);
            /*t.drawMatrix(imageVectors);
            t.cx = 0;
            t.cy = 120;
            t.drawMatrix(t.diffImgVectors);
            t.cx = 0;
            t.cy = 240;*/
            t.drawMatrix([sumOfVectors]);
            t.cx = 0;
            t.cy = 120;
            t.drawMatrix(usedEigenfaces);
            t.cx = 0;
            t.cy = 240;
            //t.drawMatrix([test]);
          }
        });
      }
    }

    document.getElementById("myButton").onclick = (e: MouseEvent) => {
      let weights: number[][][] = [];
      let pLength = imageVectors.length;
      

      for (let x = 0; x < 10/*pLength - 1*/; x++) {

        weights.push([]);
        console.log("image number" + x);
        for (let i = 0; i < this.eigenVectors.length - 1; i++) {

          let vKT = new Matrix([this.eigenVectors[i]]).transpose();
          let U = new Matrix([imageVectors[x]]);
          let M = new Matrix([this.meanVector]);
          let uU = (U.subtract(M)).mmul(vKT).to1DArray();
          weights[x].push(uU);
          //console.log(uU);
        }

      }

      let t = this;
      this.readPicture("./dist/eigenfaces/assets/subject01.wink.pgm", ()=>{
        let w: number[][] = [];


        console.log(t.testSubject);
        for (let i = 0; i < t.eigenVectors.length - 1; i++) {
          let vKT = new Matrix([t.eigenVectors[i]]).transpose();
          let U = new Matrix([t.testSubject]);
          let M = new Matrix([t.meanVector]);
          let uU = (U.subtract(M)).mmul(vKT).to1DArray();
          w.push(uU);
        }

        for (let y = 0; y < 10/*pLength - 1*/; y++) {
          for (let j = 0; j < w.length; j++) {
            console.log(t.euklidischerAbstand(w[j], weights[y][j]));
          }
        }
      });
      

    };
  }

  euklidischerAbstand(A: number[], B: number[]) {
    let d = 0;
    let sum = 0;
    for (let i = 0; i < A.length; i++) {
      sum += Math.pow((A[i] - B[i]), 2);
    }
    d = Math.sqrt(sum);
    return d;
  }

  readPicture(urlstring: string, callback: Function) {
    let t = this;
    t.testSubject = [];
    this.fs.readFile(urlstring, function (err, data) {
      if (err) throw err;
      let imgData = data;
      let c = 0;
      let start = 0;
      for (const b of imgData) {
        if (start == 0 && b == 255) {
          start = 1;
        }
        if (start == 1) {
          t.testSubject.push(+b);
          c++;
        }

      }
      //console.log(c);

      if (c != 45045) {
        for (let i = 0; i < 45045 - c; i++) {
          t.testSubject.push(255);
        }
      }

      console.log(t.testSubject);
      callback(t.testSubject);
    });
  }

  vectorLength(v: number[]) {
    let length = 0;
    v.forEach((v: number) => {
      length += Math.pow(v, 2);
    });

    length = Math.sqrt(length);
    return length;
  }

  drawMatrix(m: number[][]) {
    let dcY = 0 + this.cy;
    //console.log(m);
    let t = this;
    clearInterval(t.t);
    let width = 195 / 2;

    //console.log(m);
    m.forEach((v: number[], index: number) => {
      v.forEach((pixel: number) => {
        let ind = index;
        ////console.log(pixel);
        t.ctx.fillStyle = "rgb(" + pixel + "," + pixel + "," + pixel + ")";
        t.ctx.fillRect(this.cx, this.cy, 0.5, 0.5);
        this.cx += 0.5;
        if (this.cx == width * (ind + 1)) {
          this.cx -= width;
          this.cy += 0.5;
          //dataString += "\n";
        }
      });
      this.cx += width;
      this.cy = dcY;
      //console.log(this.cx, this.cy);
    });

  }

}
