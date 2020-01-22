import { Component } from '@angular/core';
import { Matrix, EigenvalueDecomposition } from 'ml-matrix';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Eigenfaces TS/HTML5/Angular';
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

    var c = <HTMLCanvasElement>document.getElementById("myCanvas");
    this.ctx = c.getContext("2d");

    var imgData;
    var imageVectors: number[][] = [];

    var k = 16; //Anzahl Leute in Datenbank
    var z = 3;
    for (let j = 0; j < k; j++) {
      for (let i = 1; i < z + 1; i++) {
        let urlstring = "";
        if (j < 9) {
          urlstring += "./dist/eigenfaces/assets/subject0" + (j + 1);
        } else {
          urlstring += "./dist/eigenfaces/assets/subject" + (j + 1);
        }

        switch (i - 1) {
          case 0:
            urlstring += ".normal.pgm"
            break;
          case 1:
            urlstring += ".sad.pgm"
            break;
          case 2:
            urlstring += ".happy.pgm"
            break;
          case 3:
            urlstring += ".surprised.pgm"
            break;
          case 4:
            urlstring += ".sleepy.pgm"
            break;
          case 5:
            urlstring += ".sad.pgm"
            break;
          case 6:
            urlstring += ".glasses.pgm"
            break;
          case 7:
            urlstring += ".noglasses.pgm"
            break;
          case 8:
            urlstring += ".rightlight.pgm"
            break;
          case 9:
            urlstring += ".leftlight.pgm"
            break;
          case 10:
            urlstring += ".wink.pgm"
            break;
        }

        let t = this;

        //Lese Bild als Buffer aus
        imgData = this.fs.readFileSync(urlstring);

        imageVectors.push([]);

        let start = 0;
        let count = 0;

        for (const b of imgData) {
          //Überspringe solange Buffer-Objekte bis Länge des restlichen Buffers == Breite x Länge der Bilder
          if (start == 0 && imgData.length - count == 45045) {
            start = 1;
          }
          if (start == 1) {
            imageVectors[imageVectors.length - 1].push(+b);
          }
          count++;
        }

        //Falls beim letzten Bild angekommen
        if (j === k - 1 && i == z) {
          //Summenvektor aller Gesichter
          let sumOfVectors: number[] = [];
          for (const n of imageVectors[0]) {
            sumOfVectors.push(n);
          };
          //Addiere jeden Gesichts-Vektor auf Summenvektor
          for (let i = 1; i < k; i++) {
            sumOfVectors.forEach((number: number, index: number) => {
              sumOfVectors[index] = sumOfVectors[index] + imageVectors[i][index];
            });
          }
          //Berechne Durchschnittsvektor mit Summenvektor
          sumOfVectors.forEach((number: number, index: number) => {
            sumOfVectors[index] = sumOfVectors[index] * (1 / k);
          });
          t.meanVector = sumOfVectors;
          console.log("Mean:" + sumOfVectors);
          //Erstelle Differenztgesichter durch Gesichtsbild[i] - Durchschnittsgesicht
          imageVectors.forEach((vector: number[]) => {
            t.diffImgVectors.push([]);
            vector.forEach((value: number, index: number) => {
              t.diffImgVectors[t.diffImgVectors.length - 1].push(value - sumOfVectors[index]);
            });
          });

          //Erstelle Matrix A = {diffBild_1 diffBild_2 ... diffBild_k}
          let A = new Matrix(t.diffImgVectors).transpose();
          //AT = A^T
          let AT = new Matrix(t.diffImgVectors);
          //Berechne Kovarianzmatrix C = A^T * A statt AA^T wegen Geschwindigkeitsproblematik
          let C = AT.mmul(A);
          //e = Eigenwertzerlegung von C
          let e = new EigenvalueDecomposition(C);
          //eigenV = Eigenvektor-Matrix von C
          let eigenV = e.eigenvectorMatrix;
          //eigenValues = Eigenwerte von C
          let eigenValues = e.realEigenvalues;
          //Array zur Speicherung der Eigenvektoren von C = AA^T
          let realEigenVArray: number[][] = [];
          for (let i = 0; i < eigenV.columns; i++) {
            //Multipliziere Eigenvektoren mit A um auf Eigenvektoren von AA^T zu kommen
            let e = A.mmul(eigenV.getColumnVector(i));
            let eA = e.to1DArray();
            realEigenVArray.push(eA);
          }
          console.log("C =>", C);
          console.log("A =>", A)
          console.log("AT => ", AT);
          console.log("Eigenvektor-Matrix =>", eigenV)
          console.log("Eigenvektor-Array =>", realEigenVArray);
          console.log("Eigenwerte =>", eigenValues);

          //Summe aller Eigenwerte
          let eigsum = 0;
          for (let i = eigenValues.length - 1; i > 0; i--) {
            eigsum += eigenValues[i];
          }
          //Array mit zu nutzenden Eigenfaces
          let usedEigenfaces: number[][] = [];
          //Sobald csum / eigsum > 0.95 => Anzahl bisher aufaddierter 
          //Eigenwerte reicht zum rekonstruieren von 95% der Gesichter
          let csum = 0;
          for (let j = eigenValues.length - 1; j > 0; j--) {
            csum += eigenValues[j];
            usedEigenfaces.push(realEigenVArray[j]);
            let tv = csum / eigsum;
            if (tv > 0.95) {
              t.neededEigenVs = j;
              break;
            }
          }
          //Setze zu benutzende Eigenfaces
          t.eigenVectors = usedEigenfaces;

          console.log("usedEigenfaces:", usedEigenfaces);

          //Zeichne Differenzgesichter, benutzte Eigenfaces, benutzte Trainingsbilder
          t.drawMatrix(imageVectors);
          t.cx = 0;
          t.cy = 120;
          t.drawMatrix(t.diffImgVectors);
          t.cx = 0;
          t.cy = 240;
          t.drawMatrix(usedEigenfaces);
        }
      }
    }

    let weights: number[][] = [];
    let pLength = imageVectors.length;

    for (let x = 0; x < pLength; x++) {
      let U = new Matrix([imageVectors[x]])
      weights.push([]);
      console.log("image number" + x);
      for (let i = 0; i < this.eigenVectors.length; i++) {
        let vKT = new Matrix([this.normalize(this.eigenVectors[i])]).transpose();
        let M = new Matrix([this.meanVector]);
        let uU = (U.sub(M)).mmul(vKT).to1DArray();
        weights[x].push(uU[0]);
      }
      //weights[x] = this.normalize(weights[x]);
    }

    console.log(weights);
    let testSubjects: number[][] = [];
    let pictureURL = ".wink.pgm"
    let number = "";
    for (let i = 1; i < 17; i++) {
      if (i < 10) {
        number = "0" + (i);
      } else {
        number = "" + (i);
      }
      testSubjects.push(this.readPicture("./dist/eigenfaces/assets/subject" + number + pictureURL));
    }

    this.cx = window.innerWidth / 2.3;
    this.ctx.font = '35px arial';
    this.ctx.fillText("Test-Bilder:", this.cx, 400);

    this.cx = 0;
    this.cy = 410;
    this.drawMatrix(testSubjects);

    document.getElementById("myButton").onclick = (e: MouseEvent) => {
      let t = this;
      let url = "";

      let foundFaces: number[][] = [];
      let reconFaces: number[][] = [];
      for (let n = 0; n < testSubjects.length; n++) {
        console.log(testSubjects.length);
        let subject = testSubjects[n];
        let w: number[] = [];

        //console.log(subject);

        for (let i = 0; i < t.eigenVectors.length; i++) {
          let vKT = new Matrix([t.normalize(t.eigenVectors[i])]).transpose();
          let U = new Matrix([subject]);
          let M = new Matrix([t.meanVector]);
          let uU = (U.sub(M)).mmul(vKT).to1DArray();
          //console.log(vKT, U, M, uU);
          w.push(uU[0]);
        }

        //console.log("tested image weights:", w);

        let wN = this.normalize(w);

        //console.log("normalized weights length:", wN.length, this.eigenVectors.length);
        let testRecon: number[] = [];
        Object.assign(testRecon, this.meanVector);
        for (let r = 0; r < testRecon.length; r++) {
          for (let i = 0; i < this.eigenVectors.length; i++) {
            testRecon[r] += (this.eigenVectors[i][r] * wN[i]);
          }
        }

        //console.log(testRecon);
        reconFaces.push(testRecon);

        let smallestW = 1000000000000000;
        let closestNeighbour = -1;
        let candidates: number[][] = [];
        let indexes: number[] = [];
        let eValues: number[] = [];
        let abstaende = [];
        for (let y = 0; y < weights.length/*pLength - 1*/; y++) {
          //console.log(y, weights[y]);
          let e = (t.euklidischerAbstand(wN, this.normalize(weights[y])));
          //console.log(e);
          abstaende.push(e);
          if (e < smallestW) {
            smallestW = e;
            closestNeighbour = y;
          }
        }
        console.log("Person " + n + " kleinstes d:" + smallestW);
        foundFaces.push(imageVectors[closestNeighbour]);

        candidates.push(imageVectors[closestNeighbour]);
        indexes.push(closestNeighbour);
        eValues.push(smallestW);
      }
      //console.log(foundFaces);
      t.cx = 0;
      t.cy = 550;
      t.drawMatrix(reconFaces);
      t.cx = 0;
      t.cy = 700;
      t.drawMatrix(foundFaces);
    };

  }

  normalize(A: number[]) {
    let res: number[] = [];
    let l = this.vectorLength(A);
    for (let i = 0; i < A.length; i++) {
      res.push(A[i] / l);
    }
    return res;
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

  readPicture(urlstring: string) {
    let t = this;
    t.testSubject = [];
    let dataToReturn = [];
    let imgData = this.fs.readFileSync(urlstring);
    let start = 0;
    let count = 0;

    for (const b of imgData) {
      //Überspringe solange Buffer-Objekte bis Länge des restlichen Buffers == Breite x Länge der Bilder
      if (start == 0 && imgData.length - count == 45045) {
        start = 1;
      }
      if (start == 1) {
        dataToReturn.push(+b);
      }
      count++;
    }

    return dataToReturn;
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
