import { UserModel } from '../DBModels/user.model.js';

export default class UserRepository {
    async createOrGetUser(from) {
        const user = this.#mapContextData(from);
        const existingUser = await UserModel.findOne({
            telegramId: user.telegramId
        });

        if (existingUser) return existingUser;

        return await new UserModel({
            telegramId: user.telegramId,
            firstname: user.firstname,
            username: user.username
        }).save();
    }

    #mapContextData(from) {
        return {
            telegramId: from.id,
            username: from.username,
            firstname: from.first_name
        };
    }
}
