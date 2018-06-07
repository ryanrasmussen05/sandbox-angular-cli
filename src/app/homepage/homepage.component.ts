import { Component, OnInit } from '@angular/core';

import { MobileApp } from '../static-content/interface/mobile-app';
import { StaticContentService } from '../static-content/static-content.service';

@Component({
    selector: 'rr-homepage',
    templateUrl: './homepage.component.html',
    styleUrls: ['./homepage.component.scss']
})

export class HomepageComponent implements OnInit {
    mobileApps: MobileApp[];

    constructor(private staticContentService: StaticContentService) {}

    ngOnInit() {
        this.staticContentService.getMobileApps()
            .then(mobileApps => this.mobileApps = mobileApps);
    }

    getImage(imageName: string) {
        return require('../../assets/images/' + imageName);
    }
}
