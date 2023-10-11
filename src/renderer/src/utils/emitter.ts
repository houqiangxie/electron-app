/*
 * @Descripttion: 
 * @version: 
 * @Author: houqiangxie
 * @Date: 2022-05-31 09:57:46
 * @LastEditors: houqiangxie
 * @LastEditTime: 2022-05-31 10:00:40
 */
import mitt, {
    Emitter
} from 'mitt';

type Events = {
    foo: string;
    bar ? : number;
};

const emitter: Emitter<Events> = mitt<Events>();
export default emitter;