import { Component, OnInit } from '@angular/core';

import { AndroidApp } from '../static-content/interface/android-app';
import { StaticContentService } from '../static-content/static-content.service';

@Component({
    selector: 'rr-homepage',
    templateUrl: './homepage.component.html',
    styleUrls: ['./homepage.component.scss']
})

export class HomepageComponent implements OnInit {
    androidApps: AndroidApp[];

    constructor(private staticContentService: StaticContentService) {}

    ngOnInit() {
        this.staticContentService.getAndroidApps()
            .then(androidApps => this.androidApps = androidApps);
    }

    getImage(imageName: string) {
        return require('../../assets/images/' + imageName);
    }
}
