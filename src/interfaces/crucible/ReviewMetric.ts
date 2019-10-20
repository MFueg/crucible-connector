export interface ReviewMetrics {
	metricsData: ReviewMetric[];
}

export interface ReviewMetric {
	type: string;
	configVersion: number;
	label: string;
	defaultValue: Value;
	values: Value[];
}

export interface Value {
	name: string;
	value: number;
}
