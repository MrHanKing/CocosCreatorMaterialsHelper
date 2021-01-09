/**
 * @description:
 * @author: MrHanKing
 * call:https://github.com/MrHanKing/CocosCreatorMaterialsHelper
 * @create: 2021-01-09 17:25
 */
import { MaterialAttributes } from './MaterialAttributes';
import { ITechniqueInspectorData } from './MaterialDef';

const { ccclass, property, executeInEditMode, requireComponent } = cc._decorator;

@ccclass
@executeInEditMode
@requireComponent(cc.RenderComponent)
export class MaterialsHelper extends cc.Component {
    @property({ type: [MaterialAttributes], visible: false })
    _materials: MaterialAttributes[] = [];

    @property({ type: [MaterialAttributes] })
    public get materials(): MaterialAttributes[] {
        return this._materials;
    }
    public set materials(v: MaterialAttributes[]) {
        this._materials = v;
        this.setMaterialsData(v);
    }

    onLoad() {
        this.editorRefresh();
        // 覆盖渲染数据
        this.setMaterialsData(this.materials);
    }

    private setMaterialsData(materials: MaterialAttributes[]) {
        const renderCom = this.node.getComponent(cc.RenderComponent);
        if (!renderCom) {
            return;
        }
        materials.forEach((value, index) => {
            renderCom.setMaterial(index, value.material);
            // 更新属性
            const resultMaterial = renderCom.getMaterial(index);
            for (const attr of value.attrs) {
                const result = attr.getResultValue();

                if (renderCom instanceof cc.Sprite && result instanceof cc.Texture2D) {
                    this.trySpriteSpecialHandle(attr.propName, result, renderCom);
                }

                resultMaterial.setProperty(attr.propName, result);
            }
        });
        // @ts-ignore 更新渲染
        renderCom.setVertsDirty();
        // 更新blend模式 我们没有
        // cc.BlendFunc.prototype._updateMaterial.call(renderCom);
    }

    // 这版本Sprite比较特殊
    private trySpriteSpecialHandle(propName: string, texture: cc.Texture2D, renderCom: cc.Sprite) {
        if (propName === 'texture') {
            renderCom.spriteFrame = new cc.SpriteFrame(texture);
        }
    }

    // **********************************************以下Editor接口******************************
    private editorRefresh() {
        if (!CC_EDITOR) {
            return;
        }
        // 若反序列化出来的数据已存在 则覆盖RenderComponent上的数据 不存在则说明是新挂载到RenderComponent上的 materials做初始化
        if (this.materials.length > 0) {
            this.setMaterialsData(this.materials);
        } else {
            this.editorInit();
        }
    }

    private editorInit() {
        if (!CC_EDITOR) {
            return;
        }
        const sprite = this.node.getComponent(cc.RenderComponent);
        const materials = sprite.getMaterials();
        for (let i = 0; i < materials.length; i += 1) {
            const material = materials[i];
            // @ts-ignore 材质内有此开放参数
            const effectAsset = material.effectAsset as cc.EffectAsset;
            // @ts-ignore 材质内有此开放参数
            const tech = effectAsset.getEffect().technique;
            //  @ts-ignore editor接口
            const effectConfig = cc.Effect.parseForInspector(effectAsset) as ITechniqueInspectorData[];
            // @ts-ignore 源码接口返回的name有可能是index
            const targetConfig = effectConfig.find((value) => value.name === tech.name || value.name === material.techniqueIndex);

            if (!this.materials[i]) {
                this.materials[i] = new MaterialAttributes();
            }
            this.materials[i].refresh(material, targetConfig);
        }
    }
}
