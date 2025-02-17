import { BaseComponentRender, BaseComponentSheet, Component } from '@univer/base-component';
import { Nullable, Observer, WorkBook } from '@univer/core';
import { SpreadsheetPlugin } from '@univer/base-sheets';
import styles from './index.module.less';

type RuleManageProps = {
    config?: any;
};
type RuleManageState = {
    title: LabelProps;
    buttons: LabelProps[];
    info: LabelProps[];
};
type LabelProps = {
    name?: string;
    label?: string;
    value?: string;
    active?: boolean;
};

export class RuleManage extends Component<RuleManageProps, RuleManageState> {
    private _localeObserver: Nullable<Observer<WorkBook>>;

    Render: BaseComponentRender;

    initialize() {
        const component = new SpreadsheetPlugin().getPluginByName<BaseComponentSheet>('ComponentSheet')!;
        this.Render = component.getComponentRender();

        this.state = {
            title: {
                name: 'conditionalformat.showRules',
            },
            buttons: [
                {
                    name: 'conditionalformat.newRule',
                },
                {
                    name: 'conditionalformat.editRule',
                },
                {
                    name: 'conditionalformat.deleteRule',
                },
            ],
            info: [
                {
                    name: 'conditionalformat.rule',
                },
                {
                    name: 'conditionalformat.format',
                },
                {
                    name: 'conditionalformat.applyRange',
                },
            ],
        };
    }

    setLocale() {
        // setLocale for diffrent type of modal
        const locale = this._context.getLocale();
        // set Locale for array
        function getArrayLabel(arr: LabelProps[]) {
            return arr.map((item) => {
                item.label = locale.get(item.name || '');
                return item;
            });
        }

        this.setState((prevState) => {
            let { title, buttons, info } = prevState;
            buttons = getArrayLabel(buttons);
            info = getArrayLabel(info);

            title.label = locale.get(title.name || '');

            return { title, buttons, info };
        });
    }

    componentWillMount() {
        this.setLocale();

        // subscribe Locale change event
        this._localeObserver = this._context
            .getObserverManager()
            .getObserver<WorkBook>('onAfterChangeUILocaleObservable', 'workbook')
            ?.add(() => {
                this.setLocale();
            });
    }

    componentWillUnmount() {
        this._context.getObserverManager().getObserver<WorkBook>('onAfterChangeUILocaleObservable', 'workbook')?.remove(this._localeObserver);
    }

    setValue = (value: object, fn?: () => void) => {
        this.setState(
            (prevState) => ({
                ...value,
            }),
            fn
        );
    };

    render(props: RuleManageProps, state: RuleManageState) {
        const { title, buttons, info } = state;
        const Button = this.Render.renderFunction('Button');

        return (
            <div className={styles.ruleManage}>
                <div>
                    <span>{title.label}</span>
                    <select></select>
                </div>
                <div className={styles.ruleBox}>
                    <div className={styles.ruleBtn}>
                        {buttons.map((item) => (
                            <Button>{item.label}</Button>
                        ))}
                    </div>
                    <div className={styles.ruleList}>
                        <div className={styles.listTitle}>
                            {info.map((item) => (
                                <span>{item.label}</span>
                            ))}
                        </div>
                        <div className={styles.listBox}>
                            <div className={styles.listItem}></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
