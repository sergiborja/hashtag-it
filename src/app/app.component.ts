import { Component } from "@angular/core";

import { Platform } from "@ionic/angular";
import { SplashScreen } from "@ionic-native/splash-screen/ngx";
import { StatusBar } from "@ionic-native/status-bar/ngx";
import {
  ImagePicker,
  ImagePickerOptions,
} from "@ionic-native/image-picker/ngx";
import { HttpClient } from "@angular/common/http";
import { Clipboard } from "@ionic-native/clipboard/ngx";
import { environment } from "src/environments/environment";

@Component({
  selector: "app-root",
  templateUrl: "app.component.html",
  styleUrls: ["app.component.scss"],
})
export class AppComponent {
  // public hashtags: Array<string> = [
  //   "mountains1",
  //   "mountains2",
  //   "mountains3",
  //   "mountains4",
  //   "mountains5",
  //   "mountains6",
  //   "mountains7",
  //   "mountains8",
  //   "mountains9",
  //   "mountains0",
  //   "mountains11",
  //   "mountains12",
  //   "mountains13",
  //   "mountains14",
  //   "mountains15",
  //   "mountains16",
  //   "mountains17",
  //   "mountains18",
  //   "mountains19",
  // ];
  // public hashtagsToBeCopied: Array<string> = [
  //   "mountains1",
  //   "mountains2",
  //   "mountains3",
  //   "mountains4",
  //   "mountains5",
  //   "mountains6",
  //   "mountains7",
  //   "mountains8",
  //   "mountains9",
  //   "mountains0",
  //   "mountains11",
  //   "mountains12",
  //   "mountains13",
  //   "mountains14",
  //   "mountains15",
  //   "mountains16",
  //   "mountains17",
  //   "mountains18",
  //   "mountains19",
  // ];
  public hashtagNum: number = 10;
  public imageSelected: boolean = false;
  public hashtags: Array<string> = [];
  public hashtagsToBeCopied: Array<string> = [];
  base64Selected: string;

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private imagePicker: ImagePicker,
    private http: HttpClient,
    private clipboard: Clipboard
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  copyHashtags() {
    if (this.hashtagsToBeCopied)
      this.clipboard.copy(this.hashtagsToBeCopied.join(" ").toString());
  }

  checkHashtag(hashtag) {
    const indexOfHashtag = this.hashtagsToBeCopied.indexOf(hashtag);
    if (indexOfHashtag !== -1)
      this.hashtagsToBeCopied.splice(indexOfHashtag, 1);
    else this.hashtagsToBeCopied.push(hashtag);
  }

  pickImage() {
    var options: ImagePickerOptions = {
      maximumImagesCount: 1,
      width: 600,
      height: 600,
      outputType: 1,
      quality: 600,
    };

    this.imagePicker.getPictures(options).then((results) => {
      this.base64Selected = "data: image/png;base64, " + results[0];
      this.imageSelected = true;
      this.http
        .post(
          `https://vision.googleapis.com/v1/images:annotate?key=${environment.visionKey}`,
          {
            requests: [
              {
                image: {
                  content: results[0],
                },
                features: [
                  {
                    type: "LABEL_DETECTION",
                    maxResults: 50,
                  },
                ],
              },
            ],
          }
        )
        .toPromise()
        .then((res: any) => {
          this.hashtags.length = 0;
          this.hashtagsToBeCopied.length = 0;
          res.responses[0].labelAnnotations.map((el) => {
            if (/\s/.test(el.description)) {
              var [bef, af] = el.description.split(" ");
              el.description = bef + af;
            }
            this.hashtags.push("#" + el.description);
          });
          this.hashtagsToBeCopied.push.apply(
            this.hashtagsToBeCopied,
            this.hashtags
          );
        });
    });
  }
}
