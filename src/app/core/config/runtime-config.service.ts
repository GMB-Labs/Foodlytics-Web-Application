import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { RuntimeConfig } from './runtime-config';

@Injectable({ providedIn: 'root' })
export class RuntimeConfigService {
    private _config!: RuntimeConfig;
    private readonly http = inject(HttpClient);
    get config(): RuntimeConfig { return this._config; }

    async load(): Promise<void> {
        this._config = await firstValueFrom(
            this.http.get<RuntimeConfig>('/config.json')
        );
    }
}