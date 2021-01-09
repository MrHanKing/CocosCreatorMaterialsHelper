/**
 * @description:
 * @author: MrHanKing
 * call:https://github.com/MrHanKing/CocosCreatorMaterialsHelper
 * @create: 2021-01-09 17:25
 */

export enum EPropInspectorTypeName {
    Number = 'number',
    Boolean = 'boolean',
    Asset = 'cc.Asset',
    // 其他classname 此属性不是很靠谱
}
export enum EPropInspectorAssetTypeName {
    None = 'None',
    Texture2D = 'cc.Texture2D',
}

export interface IPropInspectorData {
    defines: string[];
    type: number; // gfxType 没找到可以使用源码type的地方 此属性暂用不了
    typeName: EPropInspectorTypeName;
    value: any; // 实例数据
    valueCtor: FunctionConstructor;
    range?: number[];
    assetType?: EPropInspectorAssetTypeName;
}

export interface IPassInspectorData {
    name: string;
    props: { [key: string]: IPropInspectorData };
    defines: { [key: string]: any };
}

export interface ITechniqueInspectorData {
    name: string;
    passes: IPassInspectorData[];
}
