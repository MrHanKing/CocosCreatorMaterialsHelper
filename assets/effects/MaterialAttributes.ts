/**
 * @description:
 * @author: MrHanKing
 * call:https://github.com/MrHanKing/CocosCreatorMaterialsHelper
 * @create: 2021-01-09 17:25
 */
import { EPropInspectorAssetTypeName, EPropInspectorTypeName, IPropInspectorData, ITechniqueInspectorData } from './MaterialDef';

const { ccclass, property } = cc._decorator;

/**
 * 理论上这边的渲染逻辑要放到Vue层不应该用property修饰
 * 但是鉴于editor代码数据结构不稳定 放在装饰器这靠谱点
 */
@ccclass('MaterialAttribute')
export class MaterialAttribute {
    @property()
    propName: string = '';
    @property({
        type: Object,
        displayName: 'propValue',
        visible() {
            return (this as MaterialAttribute).showAttr(EPropInspectorAssetTypeName.None);
        },
    })
    propValue: Object = null;

    @property({
        type: cc.Texture2D,
        displayName: 'propValue',
        visible() {
            return (this as MaterialAttribute).showAttr(EPropInspectorAssetTypeName.Texture2D);
        },
    })
    textureValue: cc.Texture2D = null;

    @property({ visible: false })
    private assetType: EPropInspectorAssetTypeName = EPropInspectorAssetTypeName.None;

    public setAttribute(name: string, prop: IPropInspectorData) {
        this.propName = name;
        // 数字暂时特殊 理论这里的代码不应该存在
        if (prop.typeName === EPropInspectorTypeName.Number) {
            this.propValue = Number(prop.value);
            return;
        }
        // Asset也是特殊的
        if (prop.typeName === EPropInspectorTypeName.Asset) {
            if (prop.assetType) {
                this.assetType = prop.assetType;
            }
            return;
        }

        // 正常属性
        if (!prop.value) {
            this.propValue = new prop.valueCtor();
            return;
        }
        this.propValue = prop.value;
    }

    public getResultValue() {
        switch (this.assetType) {
            case EPropInspectorAssetTypeName.None:
                return this.propValue;
            case EPropInspectorAssetTypeName.Texture2D:
                return this.textureValue;
            default:
                console.error(`未知EPropInspectorAssetTypeName:${this.assetType}`);
                break;
        }
    }

    private showAttr(type: EPropInspectorAssetTypeName) {
        return type === this.assetType;
    }
}

@ccclass('MaterialAttributes')
export class MaterialAttributes {
    @property(cc.Material)
    material: cc.Material = null;

    @property({ type: [MaterialAttribute] })
    attrs: MaterialAttribute[] = [];

    public refresh(material: cc.Material, technique: ITechniqueInspectorData) {
        this.material = material;
        let startIndex = 0;
        const allProps: { [key: string]: IPropInspectorData } = technique.passes.reduce((previousValue, currentValue) => {
            return Object.assign(previousValue, currentValue.props);
        }, {});
        for (const [key, value] of Object.entries(allProps)) {
            if (!this.attrs[startIndex]) {
                this.attrs[startIndex] = new MaterialAttribute();
            }
            console.log(`===========================${key}=====================${JSON.stringify(value)}`);
            this.attrs[startIndex].setAttribute(key, value);
            startIndex += 1;
        }
    }
}
