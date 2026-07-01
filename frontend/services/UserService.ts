import {IService} from './IService';
import {CustomRequestOptions, DownloadFile, Theme, User, ValidationSchema} from '../types';


class UserService extends IService {

    public async fetchUser(email: string, password: string): Promise<User> {
        const headers = new Headers();
        headers.append("email", email);
        headers.append("password", password);

        const requestOptions: CustomRequestOptions = {
            headers: headers,
            responseType:"JSON"
        };
        const user = await this.get<User>(`/user/${email}`,requestOptions);
        console.log(user)
        return user;
    }

    public async updateUser(data: User, email: string): Promise<void> {

        if(!email) {
            throw new Error('Email is required to update user');
        }else if(!data) {
            throw new Error('User data is required to update user');
        }else if(email !== data.email) {
            throw new Error('Email in URL does not match email in user data');
        }

        const requestOptions: CustomRequestOptions = {
            body: data,
            bodyType: 'json'
        };

        await this.put<User>(`/user/${email}`, requestOptions);
    }

    public async getAllGeneratedLinks(): Promise<string[]> {
        return  await this.getOld<string[]>('/share/all');
    }

    async deleteSharedResource(s: string) {
        return this.delete(`/share/${s}`);
    }

    async updateTheme(email: string, newTheme: Theme) {
        if(!email) {
            throw new Error('Email is required to update theme');
        }

        const headers = new Headers();
        headers.append("theme", newTheme);

        const requestOptions: CustomRequestOptions = {
            headers: headers
        };

        await this.patch<User>(`/user/${email}/theme`, requestOptions);
    }

    async create(user: any) {
        const requestOptions = {
            body: user,
            bodyType: 'json' as const,
            responseType: 'RESPONSE' as const
        }
        console.log("Sending", requestOptions);
        return await this.post<Response>("/user/create", requestOptions);
    }
}
export const userService = new UserService();
