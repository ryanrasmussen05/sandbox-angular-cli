import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import 'rxjs/add/operator/toPromise';

import { MobileApp } from './interface/mobile-app';
import { EducationItem } from './interface/education-item';
import { ResumeItem } from './interface/resume-item';

@Injectable()
export class StaticContentService {
    constructor(private http: HttpClient) {}

    getMobileApps(): Promise<MobileApp[]> {
        return this.http.get('assets/json/mobile-apps.json')
            .toPromise()
            .catch(this.handleError);
    }

    getResumeItems(): Promise<ResumeItem[]> {
        return this.http.get('assets/json/resume-items.json')
            .toPromise()
            .catch(this.handleError);
    }

    getEducationItems(): Promise<EducationItem[]> {
        return this.http.get('assets/json/education-items.json')
            .toPromise()
            .catch(this.handleError);
    }

    private handleError(error: any): Promise<any> {
        console.error('An error occurred', error);
        return Promise.reject(error.message || error);
    }
}
