import React from 'react';
import Topic from './Topic/Topic';
import './Topics.css';

const topicFirst = [
	'Arbeit und Soziales',
	'Auswärtiges',
	'Bau und Wohnen',
	'Bildung und Forschung',
	'Digitale Agenda',
	'Entwicklung',
	'Ernährung und Landwirtschaft',
];
const topicSecond = [
	'Europäische Union',
	'Familie',
	'Finanzen',
	'Gesundheit',
	'Haushalt',
	'Inneres',
	'Kultur und Medien',
	'Menschenrechte',
	'Nachrichtendienste',
];
const topicThird = [
	'Parlamentsangelegenheiten',
	'Recht und Verbraucherschutz',
	'Sport',
	'Tourismus',
	'Umwelt',
	'Infrastruktur',
	'Verteidigung',
	'Wirtschaft und Energie',
];

interface TopicsProps {
	setFilter: Function;
	filter: Array<string>;
}

const Topics: React.FC<TopicsProps> = (props: TopicsProps) => (
	<ul className="topics-list">
		<li>
			{topicFirst.map((topic, index) => {
				return (
					<Topic
						filter={props.filter}
						setFilter={props.setFilter}
						title={topic}
						key={`topicFirst-${index}`}
					/>
				);
			})}
		</li>
		<li>
			{topicSecond.map((topic, index) => {
				return (
					<Topic
						filter={props.filter}
						setFilter={props.setFilter}
						title={topic}
						key={`topicSecond-${index}`}
					/>
				);
			})}
		</li>
		<li>
			{topicThird.map((topic, index) => {
				return (
					<Topic
						filter={props.filter}
						setFilter={props.setFilter}
						title={topic}
						key={`topicThird-${index}`}
					/>
				);
			})}
		</li>
	</ul>
);

export default Topics;
